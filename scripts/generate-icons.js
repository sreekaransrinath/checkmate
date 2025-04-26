import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const inputFile = path.join(__dirname, "../public/icons/icon.svg");
const outputDir = path.join(__dirname, "../public/icons");

async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}.png`);
    await sharp(inputFile).resize(size, size).png().toFile(outputFile);
    console.log(`Generated ${outputFile}`);
  }
}

generateIcons().catch(console.error);
