import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.resolve('./public/icon.svg'));

  await sharp(svgBuffer)
    .resize(192, 192)
    .toFormat('png')
    .toFile(path.resolve('./public/pwa-192x192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .toFormat('png')
    .toFile(path.resolve('./public/pwa-512x512.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .toFormat('png')
    .toFile(path.resolve('./public/apple-touch-icon.png'));

  // Maskable icon with 10% inner padding (410x410 scaled inside 512x512 canvas)
  const innerSize = 410;
  const innerBuffer = await sharp(svgBuffer).resize(innerSize, innerSize).toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 }
    }
  })
    .composite([{ input: innerBuffer, top: 51, left: 51 }])
    .toFormat('png')
    .toFile(path.resolve('./public/pwa-maskable-512x512.png'));

  console.log('PWA PNG Icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
