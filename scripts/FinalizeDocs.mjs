import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
let html = await readFile(resolve(root, 'dist/docs/index.html'), 'utf8');
const names = [
  'react/LICENSE',
  'react-dom/LICENSE',
  '@base-ui/react/LICENSE',
  '@base-ui/utils/LICENSE',
  '@floating-ui/react-dom/LICENSE',
  '@floating-ui/utils/LICENSE',
  'use-sync-external-store/LICENSE',
  '@babel/runtime/LICENSE',
];
const notices = await Promise.all(
  names.map(
    async (name) => `${name}\n${await readFile(resolve(root, 'node_modules', name), 'utf8')}`,
  ),
);
notices.push(
  await readFile(resolve(root, 'licenses/Inter-LICENSE.txt'), 'utf8'),
  await readFile(resolve(root, 'licenses/Material-Symbols-LICENSE.txt'), 'utf8'),
);
const version = JSON.parse(
  await readFile(resolve(root, 'packages/ui/package.json'), 'utf8'),
).version;
html = html.replace(
  '</head>',
  `<!-- @envsemble/ui ${version}\nEmbedded third-party notices\n${notices.join('\n\n').replaceAll('--', '—')} -->\n</head>`,
);
await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/DesignSystemGallery.html'), html);
console.log(
  `Built dist/DesignSystemGallery.html for @envsemble/ui ${version}; opens offline on its own.`,
);
