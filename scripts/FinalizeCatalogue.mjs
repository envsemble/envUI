import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { collectDependencyNotices } from './DependencyNotices.mjs';
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const catalogueOutputDirectory = resolve(repositoryRoot, 'dist/catalogue');
let html = await readFile(resolve(catalogueOutputDirectory, 'index.html'), 'utf8');
// Vite keeps favicon links as files even when other assets are inlined.
for (const match of html.matchAll(/<link\b[^>]*\brel="icon"[^>]*>/g)) {
  const href = match[0].match(/\bhref="([^"]+)"/)?.[1];
  if (!href || href.startsWith('data:')) continue;
  const asset = await readFile(resolve(catalogueOutputDirectory, href.replace(/^\//, '')));
  const dataUrl = `data:image/x-icon;base64,${asset.toString('base64')}`;
  html = html.replace(match[0], match[0].replace(href, dataUrl));
}
const licenseNotices = [await collectDependencyNotices(repositoryRoot)];
licenseNotices.push(
  await readFile(resolve(repositoryRoot, 'packages/ui/licenses/Inter-LICENSE.txt'), 'utf8'),
  await readFile(
    resolve(repositoryRoot, 'packages/ui/licenses/Material-Symbols-LICENSE.txt'),
    'utf8',
  ),
);
const version = JSON.parse(
  await readFile(resolve(repositoryRoot, 'packages/ui/package.json'), 'utf8'),
).version;
html = html.replace(
  '</head>',
  `<!-- @envsemble/envui ${version}\nEmbedded third-party notices\n${licenseNotices.join('\n\n').replaceAll('--', '—')} -->\n</head>`,
);
await mkdir(resolve(repositoryRoot, 'dist'), { recursive: true });
await writeFile(resolve(repositoryRoot, 'dist/envUI.html'), html);
console.log(`Built dist/envUI.html for @envsemble/envui ${version}; opens offline on its own.`);
