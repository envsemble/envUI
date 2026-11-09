// Draws the site's favicons from their source, assets/brand/envUI/envUI-favicon.svg, the envUI mark
// on its tile, which switches to its dark colors with the reader's color scheme:
//
//   envUI-favicon.ico              16, 32 and 48 px, for browsers without SVG favicons
//   envUI-apple-touch-icon.png     180 px, the tile's color to its edges, which the device rounds
//
//   node scripts/build/GenerateFavicons.ts
//
// Run it after changing the SVG, and commit what it writes. index.html links all three.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { repositoryRoot } from '../RepositoryPaths.ts';

const folder = resolve(repositoryRoot, 'assets/brand/envUI');
const svg = readFileSync(`${folder}/envUI-favicon.svg`, 'utf8');
/** The tile's color in the light scheme, which the touch icon fills its square with. */
const tile = /\.tile\s*\{\s*fill:\s*(#[0-9a-f]+)/i.exec(svg)![1];

/** An ICO file of PNG images, each of its size, as every browser since IE reads them. */
function ico(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size % 256, entry);
    header.writeUInt8(size % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ colorScheme: 'light' });
  const source = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  /** The icon drawn at `size` px, on `background` or with a clear one. */
  const draw = async (size: number, background = 'transparent') => {
    await page.setContent(
      `<body style="margin:0;background:${background}"><img src="${source}" width="${size}" height="${size}" style="display:block"></body>`,
    );
    await page.locator('img').evaluate((image: HTMLImageElement) => image.decode());
    return page.screenshot({
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: background === 'transparent',
    });
  };
  const sizes = [16, 32, 48];
  const images: { size: number; png: Buffer }[] = [];
  for (const size of sizes) images.push({ size, png: await draw(size) });
  writeFileSync(`${folder}/envUI-favicon.ico`, ico(images));
  writeFileSync(`${folder}/envUI-apple-touch-icon.png`, await draw(180, tile));
  console.log(`Wrote envUI-favicon.ico (${sizes.join(', ')} px) and envUI-apple-touch-icon.png.`);
} finally {
  await browser.close();
}
