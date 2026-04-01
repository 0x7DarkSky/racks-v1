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

function extractPrice(text) {
  if (!text) return null;

  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/,/g, ".")
    .trim();

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

  if (/(wallet|bag|watch|fashion|shirt|shoe|hoodie)/.test(n)) return "Fashion";
  if (/(earbud|headphone|keyboard|charger|phone|tech|led|lamp|portable|usb)/.test(n)) return "Tech";
  if (/(serum|skin|beauty|cream|hair|makeup)/.test(n)) return "Beauty";
  if (/(fitness|gym|band|roller|sport|abs)/.test(n)) return "Fitness";
  if (/(home|kitchen|decor|light|lamp)/.test(n)) return "Home";

  return "Tech";
}

function guessTags(name = "", price = 0) {
  const tags = ["Trending"];

  if (price >= 20 && price <= 60) tags.push("Easy to sell");
  if (price >= 50) tags.push("High commission");

  if (/new|2025|2026/.test(name.toLowerCase())) tags.push("New");

  return [...new Set(tags)].slice(0, 2);
}

async function scrapeProduct(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
  });

  const $ = cheerio.load(html);

  const name =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim();

  const imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $('img').first().attr("src") ||
    "";

  const rawPrice =
    $('meta[property="product:price:amount"]').attr("content") ||
    $('[class*="price"]').first().text() ||
    $('[id*="price"]').first().text() ||
    $('meta[name="price"]').attr("content") ||
    "";

  const price = extractPrice(rawPrice);

  console.log("Scraped name:", name);
  console.log("Scraped imageUrl:", imageUrl);
  console.log("Scraped price:", price);

  return {
    name: name?.trim(),
    imageUrl: imageUrl?.trim(),
    price,
  };
}

async function downloadAndCropImage(imageUrl, id, pageUrl) {
  if (!imageUrl) return "";

  let finalImageUrl;

  try {
    finalImageUrl = new URL(imageUrl, pageUrl).toString();
  } catch (error) {
    console.warn("Invalid image URL, skipping local crop:", imageUrl);
    return imageUrl;
  }

  if (!fs.existsSync(PRODUCTS_IMAGE_DIR)) {
    fs.mkdirSync(PRODUCTS_IMAGE_DIR, { recursive: true });
  }

  const outputFilename = `${id}.jpg`;
  const outputPath = path.join(PRODUCTS_IMAGE_DIR, outputFilename);

  try {
    const response = await axios.get(finalImageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: pageUrl,
      },
      timeout: 15000,
    });

    const inputBuffer = Buffer.from(response.data);

    await sharp(inputBuffer)
      .resize(1200, 1200, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    return `/products/${outputFilename}`;
  } catch (error) {
    console.warn("Image download/crop failed, using original image URL instead.");
    console.warn(error.message);
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

async function main() {
  try {
    const productUrl = (await ask("Product URL: ")).trim();
    const affiliate_url = (await ask("Affiliate URL: ")).trim();

    if (!productUrl) {
      throw new Error("Product URL is required.");
    }

    console.log("\n🔎 Scraping product page...");
    const scraped = await scrapeProduct(productUrl);

    let name = scraped.name;
    let price = scraped.price;
    let imageUrl = scraped.imageUrl;

    if (!name) {
      name = (await ask("Product name not found. Enter it manually: ")).trim();
    }

    if (!price) {
      const priceInput = (await ask("Price not found. Enter price manually (ex: 29.99): ")).trim();
      price = Number(priceInput);
    }

    if (!imageUrl) {
      imageUrl = (await ask("Image URL not found. Enter it manually: ")).trim();
    }

    if (!name) {
      throw new Error("Product name is required.");
    }

    if (!price || Number.isNaN(price)) {
      throw new Error("A valid price is required.");
    }

    const id = slugify(name, { lower: true, strict: true }).slice(0, 60);
    const category = guessCategory(name);
    const tags = guessTags(name, price);
    const commission_percentage = getCommissionPercentage(price);

    console.log("\n🖼️ Downloading and cropping image...");
    const localImagePath = await downloadAndCropImage(imageUrl, id, productUrl);

    const product = {
      id,
      name,
      price,
      commission_percentage,
      category,
      image_url: localImagePath || imageUrl,
      tags,
      affiliate_url,
    };

    const products = readProductsFile();

    const alreadyExists = products.some((p) => p.id === id);
    if (alreadyExists) {
      throw new Error(`A product with id "${id}" already exists.`);
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