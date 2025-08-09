import sharp from "sharp";
const src = "public/favicon.svg";

await sharp(src).resize(512,512).png().toFile("public/apple-touch-icon.png");
await sharp(src).resize(192,192).png().toFile("public/android-chrome-192.png");
await sharp(src).resize(180,180).png().toFile("public/apple-touch-icon-180.png");
await sharp(src).resize(32,32).png().toFile("public/favicon-32.png");
await sharp(src).resize(16,16).png().toFile("public/favicon-16.png");

console.log("Favicons exported.");
