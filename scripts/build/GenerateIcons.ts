import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const packageRoot = resolve(repositoryRoot, 'packages/ui');
/** A variant's file of icon-manifest.json, with its hash. */
interface IconVariant {
  source: string;
  sha256: string;
}
/** icon-manifest.json: the upstream revision, and each icon with its variants by fill. */
interface IconManifest {
  schemaVersion: number;
  iconCount: number;
  sourceCount: number;
  license: IconVariant;
  upstream: { revision: string };
  icons: { name: string; variants: Record<string, IconVariant> }[];
}
/** An SVG's view box and paths. */
interface Geometry {
  viewBox: string;
  paths: string[];
}
const manifest: IconManifest = JSON.parse(
  await readFile(resolve(packageRoot, 'icon-manifest.json'), 'utf8'),
);
if (
  manifest.schemaVersion !== 1 ||
  manifest.iconCount !== manifest.icons.length ||
  manifest.sourceCount !== manifest.icons.length * 2
) {
  throw new Error('Incomplete or unsupported official icon manifest');
}
const outputDirectory = resolve(packageRoot, 'src/icons');
const checkOnly = process.argv.includes('--check');
if (process.argv.slice(2).some((argument) => argument !== '--check'))
  throw new Error('Usage: GenerateIcons.ts [--check]');
await mkdir(outputDirectory, { recursive: true });
async function writeModule(path: string, source: string) {
  const existingSource = await readFile(path, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (existingSource === source) return;
  if (checkOnly) throw new Error(`Generated icon is stale: ${path}`);
  // Preserve timestamps for unchanged modules so local consumers avoid needless rebuilds.
  await writeFile(path, source);
}
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
if (
  hash(await readFile(resolve(packageRoot, manifest.license.source))) !== manifest.license.sha256
) {
  throw new Error('Official Material Symbols license hash mismatch');
}
/** The module's name, the symbol's in PascalCase, such as `Add` or `10k`. */
function toModuleName(name: string) {
  return name
    .split('_')
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join('');
}
async function readVerifiedGeometry(variant: IconVariant): Promise<Geometry> {
  const bytes = await readFile(resolve(packageRoot, variant.source));
  if (hash(bytes) !== variant.sha256)
    throw new Error(`Source hash mismatch: ${variant.source}. Restore with SyncIcons.ts.`);
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
function renderPaths(paths: string[]) {
  return paths.length === 1
    ? `<path d=${JSON.stringify(paths[0])} />`
    : `<>${paths.map((path) => `<path d=${JSON.stringify(path)} />`).join('')}</>`;
}

/** The start two single paths share, when it is long enough to be worth writing once. */
function shareableStart(unfilled: string[], filled: string[]) {
  if (unfilled.length !== 1 || filled.length !== 1) return '';
  const [a, b] = [unfilled[0]!, filled[0]!];
  let length = 0;
  while (length < a.length && length < b.length && a[length] === b[length]) length += 1;
  return length >= 64 ? a.slice(0, length) : '';
}

function renderIconModule(name: string, unfilled: Geometry, filled: Geometry) {
  const identicalPaths = JSON.stringify(unfilled.paths) === JSON.stringify(filled.paths);
  const identicalViewBox = unfilled.viewBox === filled.viewBox;
  const hasFillVariant = !identicalPaths || !identicalViewBox;
  const fillImport = hasFillVariant
    ? "import { useSymbolIconFill } from '../SymbolIconState.js';\n"
    : '';
  const fillParameter = hasFillVariant ? 'requestedFill' : '_filled = false';
  const fillState = hasFillVariant ? '  const filled = useSymbolIconFill(requestedFill);\n' : '';
  const viewBox = identicalViewBox
    ? JSON.stringify(unfilled.viewBox)
    : `{filled ? ${JSON.stringify(filled.viewBox)} : ${JSON.stringify(unfilled.viewBox)}}`;
  // Most symbols draw their two styles from one path whose start they share, such as a filled
  // circle that the outlined style cuts a hole in: the shared start is written once.
  const sharedStart = identicalPaths ? '' : shareableStart(unfilled.paths, filled.paths);
  const sharedDeclaration = sharedStart
    ? `\n/** The path both styles start with. */\nconst start = ${JSON.stringify(sharedStart)};\n`
    : '';
  const fromStart = (path: string) =>
    path === sharedStart ? 'start' : `start + ${JSON.stringify(path.slice(sharedStart.length))}`;
  const paths = identicalPaths
    ? renderPaths(unfilled.paths)
    : sharedStart
      ? `<path d={filled ? ${fromStart(filled.paths[0])} : ${fromStart(unfilled.paths[0])}} />`
      : `{filled ? ${renderPaths(filled.paths)} : ${renderPaths(unfilled.paths)}}`;

  // An icon that follows the selection's fill reads it from context, so it is a client module for
  // React Server Components; one without a filled variant renders on the server.
  const directive = hasFillVariant ? "'use client';\n\n" : '';
  return `// Generated from Google Material Symbols (${manifest.upstream.revision}); Apache-2.0.\n// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.\n${directive}import { Icon, type SymbolIconProps } from '../Icon.js';\n${fillImport}${sharedDeclaration}\nexport function ${name}({ filled: ${fillParameter}, ...props }: SymbolIconProps) {\n${fillState}  return <Icon viewBox=${viewBox} {...props}>${paths}</Icon>;\n}\n`;
}

// Every icon exports its module's name with the Icon prefix, `IconAdd` from icons/Add, so no icon
// shares its name with a component, such as Link or Menu.
const generatedFiles = new Set(['index.ts', 'Typography.tsx']);
const moduleNames = new Set<string>();
const iconEntries = manifest.icons.map((icon) => {
  const module = toModuleName(icon.name);
  if (moduleNames.has(module)) throw new Error(`Icon name collision: ${module}`);
  moduleNames.add(module);
  generatedFiles.add(module + '.tsx');
  return { module, name: 'Icon' + module, icon };
});

// Bound I/O concurrency; export order still follows the manifest's preflight above.
let nextIconIndex = 0;
async function generateIconModules() {
  while (nextIconIndex < iconEntries.length) {
    const { module, name, icon } = iconEntries[nextIconIndex++]!;
    const [unfilled, filled] = await Promise.all([
      readVerifiedGeometry(icon.variants['0']!),
      readVerifiedGeometry(icon.variants['1']!),
    ]);
    await writeModule(
      resolve(outputDirectory, module + '.tsx'),
      renderIconModule(name, unfilled, filled),
    );
  }
}
await Promise.all(Array.from({ length: 8 }, () => generateIconModules()));
if (!moduleNames.has('TextFields'))
  throw new Error('Typography alias requires official text_fields');
await writeModule(
  resolve(outputDirectory, 'Typography.tsx'),
  "// Friendly alias for the official text_fields symbol.\nimport type { SymbolIconProps } from '../Icon.js';\nimport { IconTextFields } from './TextFields.js';\n\nexport function IconTypography(props: SymbolIconProps) {\n  return <IconTextFields {...props} />;\n}\n",
);
await writeModule(
  resolve(outputDirectory, 'index.ts'),
  '// Generated by scripts/build/GenerateIcons.ts, with the icon modules beside it. Do not edit.\n' +
    iconEntries.map(({ module, name }) => `export { ${name} } from './${module}.js';`).join('\n') +
    "\nexport { IconTypography } from './Typography.js';\nexport type { SymbolIconProps } from '../Icon.js';\n",
);
// Remove only obsolete generated modules. Leave independently authored files alone.
for (const file of await readdir(outputDirectory)) {
  if (generatedFiles.has(file) || !file.endsWith('.tsx')) continue;
  const source = await readFile(resolve(outputDirectory, file), 'utf8');
  if (source.startsWith('// Generated from Google Material Symbols')) {
    if (checkOnly) throw new Error(`Obsolete generated icon: ${file}`);
    await unlink(resolve(outputDirectory, file));
  }
}
console.log(
  `${checkOnly ? 'Verified' : 'Generated'} ${manifest.iconCount} official icons and the Typography alias from ${manifest.sourceCount} verified SVGs (offline).`,
);
