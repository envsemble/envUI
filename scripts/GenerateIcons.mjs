import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = resolve(root, 'packages/ui');
const manifest = JSON.parse(await readFile(resolve(packageRoot, 'icon-manifest.json'), 'utf8'));
if (
  manifest.schemaVersion !== 1 ||
  manifest.iconCount !== manifest.icons.length ||
  manifest.sourceCount !== manifest.icons.length * 2
) {
  throw new Error('Incomplete or unsupported official icon manifest');
}
const output = resolve(packageRoot, 'src/icons');
const check = process.argv.includes('--check');
if (process.argv.slice(2).some((argument) => argument !== '--check'))
  throw new Error('Usage: GenerateIcons.mjs [--check]');
await mkdir(output, { recursive: true });
async function writeModule(path, source) {
  if (check) {
    if ((await readFile(path, 'utf8').catch(() => null)) !== source)
      throw new Error(`Generated icon is stale: ${path}`);
  } else await writeFile(path, source);
}
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
if (
  hash(await readFile(resolve(packageRoot, manifest.license.source))) !== manifest.license.sha256
) {
  throw new Error('Official Material Symbols license hash mismatch');
}
function componentName(name) {
  const pascal = name
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
  return /^\d/.test(pascal) ? 'Icon' + pascal : pascal;
}
async function geometry(variant) {
  const bytes = await readFile(resolve(packageRoot, variant.source));
  if (hash(bytes) !== variant.sha256)
    throw new Error(`Source hash mismatch: ${variant.source}. Restore with SyncIcons.mjs.`);
  const source = bytes.toString('utf8');
  const match = /^<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/.exec(source);
  const explicitViewBox = match?.[1].match(/\bviewBox="([^"]+)"/)?.[1];
  const width = match?.[1].match(/\bwidth="([\d.]+)"/)?.[1];
  const height = match?.[1].match(/\bheight="([\d.]+)"/)?.[1];
  // Some legacy official symbols use a 24x24 viewport without a viewBox.
  // Make that implicit coordinate system explicit before using relative sizes.
  const viewBox = explicitViewBox ?? (width && height ? `0 0 ${width} ${height}` : undefined);
  if (!match || !viewBox) throw new Error(`Missing viewBox: ${variant.source}`);
  // Official monochrome symbols currently contain path elements only. Fail closed on
  // a new upstream SVG shape rather than introducing an unchecked markup converter.
  const body = match[2].trim();
  const paths = [...body.matchAll(/<path d="([^"]+)"\s*\/>/g)].map((path) => path[1]);
  if (!paths.length || body.replace(/<path d="[^"]+"\s*\/>/g, '').trim())
    throw new Error(`Unsupported SVG markup: ${variant.source}`);
  return { viewBox, paths };
}
const generated = new Set(['index.ts', 'Typography.tsx']);
const names = new Set();
for (const icon of manifest.icons) {
  const name = componentName(icon.name);
  if (names.has(name)) throw new Error(`Component name collision: ${name}`);
  names.add(name);
  const unfilled = await geometry(icon.variants['0']);
  const filled = await geometry(icon.variants['1']);
  const render = (paths) =>
    paths.length === 1
      ? `<path d=${JSON.stringify(paths[0])} />`
      : `<>${paths.map((path) => `<path d=${JSON.stringify(path)} />`).join('')}</>`;
  const identical = JSON.stringify(unfilled.paths) === JSON.stringify(filled.paths);
  const sameViewBox = unfilled.viewBox === filled.viewBox;
  const hasFillVariant = !identical || !sameViewBox;
  const source = `// Generated from Google Material Symbols (${manifest.upstream.revision}); Apache-2.0.\n// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.\nimport { Icon, type MaterialSymbolProps } from '../Icon.js';\n${hasFillVariant ? "import { useMaterialSymbolFill } from '../MaterialSymbolState.js';\n" : ''}\nexport function ${name}({ filled: ${hasFillVariant ? 'requestedFill' : '_filled = false'}, ...props }: MaterialSymbolProps) {\n${hasFillVariant ? '  const filled = useMaterialSymbolFill(requestedFill);\n' : ''}  return <Icon viewBox=${sameViewBox ? JSON.stringify(unfilled.viewBox) : `{filled ? ${JSON.stringify(filled.viewBox)} : ${JSON.stringify(unfilled.viewBox)}}`} {...props}>${identical ? render(unfilled.paths) : `{filled ? ${render(filled.paths)} : ${render(unfilled.paths)}}`}</Icon>;\n}\n`;
  await writeModule(resolve(output, name + '.tsx'), source);
  generated.add(name + '.tsx');
}
if (!names.has('TextFields')) throw new Error('Typography alias requires official text_fields');
await writeModule(
  resolve(output, 'Typography.tsx'),
  "// Friendly alias for the official text_fields symbol.\nimport type { MaterialSymbolProps } from '../Icon.js';\nimport { TextFields } from './TextFields.js';\n\nexport function Typography(props: MaterialSymbolProps) {\n  return <TextFields {...props} />;\n}\n",
);
await writeModule(
  resolve(output, 'index.ts'),
  [...names].map((name) => `export { ${name} } from './${name}.js';`).join('\n') +
    "\nexport { Typography } from './Typography.js';\nexport type { MaterialSymbolProps } from '../Icon.js';\n",
);
// Remove only obsolete generated modules. Leave independently authored files alone.
for (const file of await readdir(output)) {
  if (generated.has(file) || !file.endsWith('.tsx')) continue;
  const source = await readFile(resolve(output, file), 'utf8');
  if (source.startsWith('// Generated from Google Material Symbols')) {
    if (check) throw new Error(`Obsolete generated icon: ${file}`);
    await unlink(resolve(output, file));
  }
}
console.log(
  `${check ? 'Verified' : 'Generated'} ${manifest.iconCount} official icons and the Typography alias from ${manifest.sourceCount} verified SVGs (offline).`,
);
