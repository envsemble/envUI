import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
async function dataUrl(path) {
  return `data:${types[extname(path)]};base64,${(await readFile(path)).toString('base64')}`;
}
async function replaceAsync(text, regex, transform) {
  const matches = [...text.matchAll(regex)];
  for (const match of matches.reverse()) {
    text =
      text.slice(0, match.index) +
      (await transform(match)) +
      text.slice(match.index + match[0].length);
  }
  return text;
}
let html = await readFile(resolve(root, 'envUI.html'), 'utf8');
html = await replaceAsync(
  html,
  /<link rel="stylesheet" href="([^"]+)"\s*\/>/g,
  async ([, path]) => {
    const file = resolve(root, path);
    let css = await readFile(file, 'utf8');
    css = await replaceAsync(css, /url\(["']?([^)'"\s]+)["']?\)/g, async ([original, url]) => {
      if (url.startsWith('data:')) return original;
      return `url("${await dataUrl(resolve(dirname(file), url))}")`;
    });
    return `<style>\n${css}\n</style>`;
  },
);
html = await replaceAsync(
  html,
  /assets\/(?:brand|material-symbols-rounded)\/(?:[\w-]+\/)*[\w-]+\.(?:svg|ico)/g,
  async ([path]) => await dataUrl(resolve(root, path)),
);
html = await replaceAsync(html, /<script src="([^"]+)"><\/script>/g, async ([, path]) => {
  const source = await readFile(resolve(root, path), 'utf8');
  return `<script>\n${source.replaceAll('</script', '<\\/script')}\n</script>`;
});
const licenses = await Promise.all(
  ['Inter-LICENSE.txt', 'Material-Symbols-LICENSE.txt'].map((name) =>
    readFile(resolve(root, 'licenses', name), 'utf8'),
  ),
);
html = html.replace(
  '</head>',
  `<!-- Embedded asset licenses\n${licenses.join('\n\n').replaceAll('--', '—')}\n-->\n</head>`,
);
await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/envUI.html'), html);
console.log('Built dist/envUI.html — send this file on its own.');
