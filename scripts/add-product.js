import fs from "fs";
import path from "path";
import readline from "readline";
import slugify from "slugify";

const PRODUCTS_FILE = path.resolve("src/data/products.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  try {
    const name = (await ask("Product name: ")).trim();
    const priceInput = (await ask("Price (ex: 29.99): ")).trim();
    const commissionInput = (await ask("Commission % (ex: 25): ")).trim();
    const category = (await ask("Category (Fashion, Tech, Beauty, Fitness, Home...): ")).trim();
    const image_url = (await ask("Image URL: ")).trim();
    const tagsInput = (await ask('Tags separated by commas (ex: Trending, Easy to sell): ')).trim();
    const affiliate_url = (await ask("Affiliate URL: ")).trim();

    if (!name) {
      throw new Error("Product name is required.");
    }

    const price = Number(priceInput);
    const commission_percentage = Number(commissionInput);

    if (Number.isNaN(price)) {
      throw new Error("Price must be a valid number.");
    }

    if (Number.isNaN(commission_percentage)) {
      throw new Error("Commission percentage must be a valid number.");
    }

    const tags = tagsInput
      ? tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    const id = slugify(name, { lower: true, strict: true });

    const product = {
      id,
      name,
      price,
      commission_percentage,
      category: category || "Tech",
      image_url,
      tags,
      affiliate_url,
    };

    if (!fs.existsSync(PRODUCTS_FILE)) {
      throw new Error(`File not found: ${PRODUCTS_FILE}`);
    }

    const fileContent = fs.readFileSync(PRODUCTS_FILE, "utf8");
    const prefix = "export const products =";

    if (!fileContent.includes(prefix)) {
      throw new Error("products.js format not recognized.");
    }

    const arrayString = fileContent.replace(prefix, "").trim().replace(/;$/, "");
    const products = eval(arrayString);

    const alreadyExists = products.some((p) => p.id === id);
    if (alreadyExists) {
      throw new Error(`A product with id "${id}" already exists.`);
    }

    products.push(product);

    const newFileContent = `export const products = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync(PRODUCTS_FILE, newFileContent, "utf8");

    console.log("\n✅ Product added successfully:");
    console.log(product);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

main();