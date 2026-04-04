import fs from "fs";
import path from "path";
import readline from "readline";
import axios from "axios";
import * as cheerio from "cheerio";
import sharp from "sharp";
import slugify from "slugify";

const PRODUCTS_FILE = path.resolve("src/data/products.js");
const PRODUCTS_IMAGE_DIR = path.resolve("public/products");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function cleanProductName(name = "") {
  return normalizeText(name)
    .replace(/\s*-\s*Amazon\..*$/i, "")
    .replace(/\s*\|\s*Amazon\..*$/i, "")
    .trim();
}

function shortenProductName(name = "") {
  const cleaned = normalizeText(name)
    .replace(/\(.*?\)/g, "")
    .replace(/[,]/g, "")
    .replace(/[-|–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter(Boolean);
  const short = words.slice(0, 6).join(" ");

  return short.length > 60 ? `${short.slice(0, 60)}...` : short;
}

function extractPrice(text) {
  if (!text) return null;

  const cleaned = normalizeText(text).replace(/,/g, ".");
  const match = cleaned.match(/(\d+(?:\.\d{1,2})?)/);

  if (!match) return null;

  const price = Number(match[1]);
  return Number.isNaN(price) ? null : price;
}

function getCommissionPercentage(price) {
  if (!price || Number.isNaN(price)) return 25;
  if (price < 20) return 20;
  if (price < 50) return 25;
  if (price < 100) return 30;
  return 15;
}

function guessCategory(name = "") {
  const n = name.toLowerCase();

  if (/(wallet|bag|watch|fashion|shirt|shoe|hoodie|sneaker|jacket)/.test(n)) return "Fashion";
  if (/(earbud|headphone|keyboard|charger|phone|tech|usb|powerbank|wireless|portable)/.test(n)) return "Tech";
  if (/(serum|skin|beauty|cream|hair|makeup|cosmetic|skincare|gel|cleanser|lotion)/.test(n)) return "Beauty";
  if (/(fitness|gym|band|roller|sport|abs|yoga|muscle)/.test(n)) return "Fitness";
  if (/(home|kitchen|decor|lamp|light|desk|chair|organizer)/.test(n)) return "Home";
  if (/(cat|dog|pet|animal|arbre a chat|arbre à chat|litter|hamster)/.test(n)) return "Home";

  return "Tech";
}

function guessTags(name = "", price = 0) {
  const lower = name.toLowerCase();
  const tags = ["Trending"];

  if (price >= 20 && price <= 60) tags.push("Easy to sell");
  if (price >= 50) tags.push("High commission");
  if (/new|2025|2026/.test(lower)) tags.push("New");
  if (/portable|wireless|magnetic|led|viral|tiktok/.test(lower)) tags.push("Popular");

  return [...new Set(tags)].slice(0, 2);
}

function isSuspiciousImageUrl(url = "") {
  const lower = url.toLowerCase();

  return (
    !url ||
    lower.includes("fls-eu.amazon") ||
    lower.includes("uedata=") ||
    lower.includes("pixel") ||
    lower.includes("spacer") ||
    lower.includes("transparent") ||
    lower.includes("sprite") ||
    lower.endsWith(".svg")
  );
}

async function scrapeProduct(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    timeout: 20000,
  });

  const $ = cheerio.load(html);

  const name =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("#productTitle").text() ||
    $("h1").first().text() ||
    $("title").text();

  const imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $("#landingImage").attr("src") ||
    $("#imgTagWrapperId img").attr("src") ||
    $("img").first().attr("src") ||
    "";

  const rawPrice =
    $('meta[property="product:price:amount"]').attr("content") ||
    $("#priceblock_ourprice").text() ||
    $("#priceblock_dealprice").text() ||
    $(".a-price .a-offscreen").first().text() ||
    $('[class*="price"]').first().text() ||
    $('[id*="price"]').first().text() ||
    $('meta[name="price"]').attr("content") ||
    "";

  const price = extractPrice(rawPrice);

  const cleanedName = cleanProductName(name);
  const cleanedImage = normalizeText(imageUrl);

  console.log("Scraped name:", cleanedName);
  console.log("Scraped imageUrl:", cleanedImage);
  console.log("Scraped price:", price);

  return {
    name: cleanedName,
    imageUrl: cleanedImage,
    price,
  };
}

async function ensureGoodImageUrl(imageUrl, pageUrl) {
  let candidate = imageUrl;

  if (!candidate || isSuspiciousImageUrl(candidate)) {
    console.log("\n⚠️ Scraped image looks suspicious or unusable.");
    console.log("Scraped image URL:", candidate || "(empty)");
    candidate = (await ask("Paste a better image URL manually: ")).trim();
  }

  if (!candidate) return "";

  try {
    return new URL(candidate, pageUrl).toString();
  } catch {
    console.warn("Invalid image URL after manual fallback.");
    return "";
  }
}

async function getAverageCornerColor(inputBuffer) {
  const image = sharp(inputBuffer);
  const meta = await image.metadata();

  const width = meta.width || 0;
  const height = meta.height || 0;

  if (!width || !height) {
    return { r: 245, g: 245, b: 245, alpha: 1 };
  }

  const sampleSize = Math.max(20, Math.floor(Math.min(width, height) * 0.06));

  const corners = [
    { left: 0, top: 0 },
    { left: Math.max(0, width - sampleSize), top: 0 },
    { left: 0, top: Math.max(0, height - sampleSize) },
    { left: Math.max(0, width - sampleSize), top: Math.max(0, height - sampleSize) },
  ];

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalPixels = 0;

  for (const corner of corners) {
    const { data, info } = await sharp(inputBuffer)
      .extract({
        left: corner.left,
        top: corner.top,
        width: sampleSize,
        height: sampleSize,
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += info.channels) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      totalPixels++;
    }
  }

  if (!totalPixels) {
    return { r: 245, g: 245, b: 245, alpha: 1 };
  }

  return {
    r: Math.round(totalR / totalPixels),
    g: Math.round(totalG / totalPixels),
    b: Math.round(totalB / totalPixels),
    alpha: 1,
  };
}

function normalizeBackgroundColor(bg) {
  return {
    r: Math.min(255, Math.max(0, bg.r)),
    g: Math.min(255, Math.max(0, bg.g)),
    b: Math.min(255, Math.max(0, bg.b)),
    alpha: 1,
  };
}

async function isCleanPackshot(inputBuffer) {
  const { data } = await sharp(inputBuffer)
    .resize(50, 50)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let variation = 0;

  for (let i = 0; i < data.length - 3; i += 3) {
    const diff =
      Math.abs(data[i] - data[i + 3]) +
      Math.abs(data[i + 1] - data[i + 4]) +
      Math.abs(data[i + 2] - data[i + 5]);

    variation += diff;
  }

  return variation < 50000;
}

async function buildPremiumSquareImage(inputBuffer, outputPath) {
  const meta = await sharp(inputBuffer).metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;

  if (!width || !height) {
    throw new Error("Unable to read image dimensions.");
  }

  const ratio = width / height;
  const isPortrait = ratio < 0.8;
  const isLandscape = ratio > 1.25;

  const sampledBg = await getAverageCornerColor(inputBuffer);
  const background = normalizeBackgroundColor(sampledBg);

  let trimmedBuffer = inputBuffer;
  try {
    trimmedBuffer = await sharp(inputBuffer)
      .flatten({ background })
      .trim({
        background,
        threshold: 18,
      })
      .toBuffer();
  } catch {
    trimmedBuffer = inputBuffer;
  }

  try {
    trimmedBuffer = await sharp(trimmedBuffer)
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .trim({
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        threshold: 24,
      })
      .toBuffer();
  } catch {
    // keep previous trimmedBuffer
  }

  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  const tWidth = trimmedMeta.width || width;
  const tHeight = trimmedMeta.height || height;
  const tRatio = tWidth / tHeight;

  const likelyPackshot = tRatio < 0.8 || isPortrait;

  const CANVAS = 1200;

  let resizedBuffer;
  let resizedMeta;

  if (likelyPackshot) {
    resizedBuffer = await sharp(trimmedBuffer)
      .resize({
        width: 1020,
        height: 1020,
        fit: "inside",
        withoutEnlargement: false,
      })
      .toBuffer();

    resizedMeta = await sharp(resizedBuffer).metadata();
  } else if (isLandscape) {
    resizedBuffer = await sharp(trimmedBuffer)
      .resize({
        width: 1080,
        height: 1080,
        fit: "inside",
        position: "attention",
        withoutEnlargement: false,
      })
      .toBuffer();

    resizedMeta = await sharp(resizedBuffer).metadata();
  } else {
    resizedBuffer = await sharp(trimmedBuffer)
      .resize({
        width: 1000,
        height: 1000,
        fit: "inside",
        position: "center",
        withoutEnlargement: false,
      })
      .toBuffer();

    resizedMeta = await sharp(resizedBuffer).metadata();
  }

  const finalWidth = resizedMeta.width || 900;
  const finalHeight = resizedMeta.height || 900;

  const left = Math.round((CANVAS - finalWidth) / 2);

  let top = Math.round((CANVAS - finalHeight) / 2);
  if (likelyPackshot) {
    top -= 10;
  }
  if (top < 0) top = 0;

  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: resizedBuffer,
        left,
        top,
      },
    ])
    .jpeg({ quality: 92 })
    .toFile(outputPath);
}

async function downloadAndCropImage(imageUrl, id, pageUrl) {
  if (!imageUrl) return "";

  const finalImageUrl = await ensureGoodImageUrl(imageUrl, pageUrl);

  if (!finalImageUrl) {
    console.warn("No valid image URL available, skipping crop.");
    return "";
  }

  if (!fs.existsSync(PRODUCTS_IMAGE_DIR)) {
    fs.mkdirSync(PRODUCTS_IMAGE_DIR, { recursive: true });
  }

  const outputFilename = `${id}-${Date.now()}.jpg`;
  const outputPath = path.join(PRODUCTS_IMAGE_DIR, outputFilename);

  try {
    const response = await axios.get(finalImageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: pageUrl,
      },
      timeout: 20000,
    });

    const inputBuffer = Buffer.from(response.data);
    const cleanPackshot = await isCleanPackshot(inputBuffer);

    if (cleanPackshot) {
      console.log("✅ Clean image detected → trim + simple resize, no external canvas");

      let processedBuffer = inputBuffer;

      try {
        processedBuffer = await sharp(inputBuffer)
          .trim({ threshold: 12 })
          .resize({
            width: 1000,
            withoutEnlargement: false,
          })
          .jpeg({ quality: 92 })
          .toBuffer();
      } catch {
        processedBuffer = inputBuffer;
      }

      await sharp(processedBuffer).toFile(outputPath);

      return `/products/${outputFilename}`;
    }

    console.log("🎨 Complex image detected → applying smart premium framing");
    await buildPremiumSquareImage(inputBuffer, outputPath);

    return `/products/${outputFilename}`;
  } catch (error) {
    console.warn("Image failed:", error.message);
    return finalImageUrl;
  }
}

function readProductsFile() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    throw new Error(`File not found: ${PRODUCTS_FILE}`);
  }

  const fileContent = fs.readFileSync(PRODUCTS_FILE, "utf8");
  const prefix = "export const products =";

  if (!fileContent.includes(prefix)) {
    throw new Error("products.js format not recognized.");
  }

  const arrayString = fileContent.replace(prefix, "").trim().replace(/;$/, "");
  return eval(arrayString);
}

function writeProductsFile(products) {
  const newFileContent = `export const products = ${JSON.stringify(products, null, 2)};\n`;
  fs.writeFileSync(PRODUCTS_FILE, newFileContent, "utf8");
}

async function confirmProduct(product) {
  console.log("\n🧾 Product preview:");
  console.log(JSON.stringify(product, null, 2));

  const answer = (await ask("\nConfirm add product? (y/n): ")).trim().toLowerCase();
  return answer === "y" || answer === "yes";
}

async function main() {
  try {
    const productUrl = (await ask("Product URL: ")).trim();
    const affiliate_url = (await ask("Affiliate URL: ")).trim();

    if (!productUrl) {
      throw new Error("Product URL is required.");
    }

    if (!affiliate_url) {
      throw new Error("Affiliate URL is required.");
    }

    console.log("\n🔎 Scraping product page...");
    const scraped = await scrapeProduct(productUrl);

    let fullName = scraped.name;
    let price = scraped.price;
    let imageUrl = scraped.imageUrl;

    if (!fullName) {
      fullName = (await ask("Product name not found. Enter it manually: ")).trim();
    }

    if (!price) {
      const priceInput = (await ask("Price not found. Enter price manually (ex: 29.99): ")).trim();
      price = Number(priceInput);
    }

    if (!imageUrl) {
      imageUrl = (await ask("Image URL not found. Enter it manually: ")).trim();
    }

    if (!fullName) {
      throw new Error("Product name is required.");
    }

    if (!price || Number.isNaN(price)) {
      throw new Error("A valid price is required.");
    }

    const shortName = shortenProductName(fullName);
    const id = slugify(fullName, { lower: true, strict: true }).slice(0, 60);
    const category = guessCategory(fullName);
    const tags = guessTags(fullName, price);
    const commission_percentage = getCommissionPercentage(price);

    console.log("\n🖼️ Downloading and formatting image...");
    const localImagePath = await downloadAndCropImage(imageUrl, id, productUrl);

    const product = {
      id,
      name: shortName,
      full_name: fullName,
      price,
      commission_percentage,
      category,
      image_url: localImagePath || imageUrl,
      tags,
      affiliate_url,
    };

    const products = readProductsFile();

    const duplicateId = products.some((p) => p.id === id);
    if (duplicateId) {
      throw new Error(`A product with id "${id}" already exists.`);
    }

    const duplicateAffiliate = products.some((p) => p.affiliate_url === affiliate_url);
    if (duplicateAffiliate) {
      throw new Error("A product with this affiliate_url already exists.");
    }

    const confirmed = await confirmProduct(product);
    if (!confirmed) {
      console.log("\n⛔ Product creation cancelled.");
      return;
    }

    products.push(product);
    writeProductsFile(products);

    console.log("\n✅ Product added successfully:\n");
    console.log(product);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

main();