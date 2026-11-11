import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { libraryDirectory } from '../RepositoryPaths.ts';

// Maintainer-only command. Consumer installation and ordinary builds never fetch icons.
const manifestPath = resolve(libraryDirectory, 'icon-manifest.json');
const initialRevision = 'bd8cb85bd4bad964fe6918f79665bb40c3a8efef';
const args = process.argv.slice(2);
if (
  args.length &&
  (args.length !== 2 || args[0] !== '--revision' || !/^[a-f0-9]{40}$/.test(args[1]))
) {
  throw new Error('Usage: node scripts/build/SyncIcons.ts [--revision <full upstream commit SHA>]');
}
/** An icon of the manifest: its name and its two variants, by fill, with their files' hashes. */
interface ManifestIcon {
  name: string;
  upstreamTreeSha?: string;
  variants: Record<
    string,
    { source: string; sha256: string; upstreamPath?: string; gitBlobSha?: string }
  >;
}
const previous: { upstream: { revision: string }; icons: ManifestIcon[] } | null = await readFile(
  manifestPath,
  'utf8',
)
  .then(JSON.parse)
  .catch(() => null);
const revision = args[1] ?? previous?.upstream.revision ?? initialRevision;
const repository = 'https://github.com/google/material-design-icons';
const api = 'https://api.github.com/repos/google/material-design-icons/git/trees/';
const raw = `https://raw.githubusercontent.com/google/material-design-icons/${revision}/`;
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const gitBlobHash = (bytes: Buffer) =>
  createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
async function download(url: string): Promise<Buffer> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'envui-official-icon-sync' },
        signal: AbortSignal.timeout(45_000),
      });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((done) => setTimeout(done, 1000 * (attempt + 1)));
    }
  }
  throw new Error(`Could not download ${url}`);
}
/** An entry of a GitHub tree: a file or a folder. */
interface TreeEntry {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

async function tree(sha: string): Promise<TreeEntry[]> {
  const result = JSON.parse((await download(api + sha)).toString('utf8'));
  if (result.truncated || !Array.isArray(result.tree))
    throw new Error(`Incomplete upstream tree ${sha}`);
  return result.tree;
}
const rootTree = await tree(revision);
const symbols = rootTree.find((entry) => entry.path === 'symbols');
if (!symbols) throw new Error('Official symbols directory is missing');
const symbolsTree = await tree(symbols.sha);
const web = symbolsTree.find((entry) => entry.path === 'web');
if (!web) throw new Error('Official symbols/web directory is missing');
const catalogue = (await tree(web.sha))
  .filter((entry) => entry.type === 'tree')
  .sort((a, b) => (a.path < b.path ? -1 : 1));
// The upstream SVGs, kept unchanged in the package's vendor/ folder, outside its source.
const vendorFolder = 'vendor/material-symbols-rounded';
const vendored = resolve(libraryDirectory, vendorFolder);
await mkdir(vendored, { recursive: true });
const previousIcons = new Map(previous?.icons.map((icon) => [icon.name, icon]) ?? []);
let completed = 0;
const icons: ManifestIcon[] = new Array(catalogue.length);
let cursor = 0;
async function worker() {
  while (cursor < catalogue.length) {
    const index = cursor++;
    const entry = catalogue[index];
    const variants: ManifestIcon['variants'] = {};
    for (const fill of [0, 1]) {
      const filename = `${entry.path}${fill ? '_fill1' : ''}_24px.svg`;
      const upstreamPath = `symbols/web/${entry.path}/materialsymbolsrounded/${filename}`;
      const source = `${vendorFolder}/${filename}`;
      const saved =
        previous?.upstream.revision === revision &&
        previousIcons.get(entry.path)?.variants[String(fill)];
      let bytes: Buffer | null = saved
        ? await readFile(resolve(libraryDirectory, source)).catch(() => null)
        : null;
      if (!saved || !bytes || hash(bytes) !== saved.sha256)
        bytes = await download(raw + upstreamPath);
      if (!bytes.toString('utf8').startsWith('<svg'))
        throw new Error(`Not an SVG: ${upstreamPath}`);
      await writeFile(resolve(libraryDirectory, source), bytes);
      variants[String(fill)] = {
        upstreamPath,
        source,
        sha256: hash(bytes),
        gitBlobSha: gitBlobHash(bytes),
      };
    }
    icons[index] = { name: entry.path, upstreamTreeSha: entry.sha, variants };
    completed++;
    if (completed % 250 === 0 || completed === catalogue.length)
      console.log(`Synced ${completed}/${catalogue.length} official Rounded icons`);
  }
}
await Promise.all(Array.from({ length: 24 }, () => worker()));
const licenseBytes = await download(raw + 'LICENSE');
await mkdir(resolve(libraryDirectory, 'licenses'), { recursive: true });
await writeFile(resolve(libraryDirectory, 'licenses/Material-Symbols-LICENSE.txt'), licenseBytes);
const manifest = {
  schemaVersion: 1,
  upstream: { repository, revision, cataloguePath: 'symbols/web', catalogueTreeSha: web.sha },
  axes: {
    family: 'Material Symbols Rounded',
    weight: 400,
    grade: 0,
    opticalSize: 24,
    fill: [0, 1],
  },
  naming:
    'Snake case becomes PascalCase, the module of icons/<Name>, which exports Icon<Name>: icons/Add exports IconAdd and icons/10k exports Icon10k. Typography is an alias for TextFields.',
  license: {
    source: 'licenses/Material-Symbols-LICENSE.txt',
    upstreamPath: 'LICENSE',
    sha256: hash(licenseBytes),
  },
  iconCount: icons.length,
  sourceCount: icons.length * 2,
  icons,
};
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
const expected = new Set(
  icons.flatMap((icon) =>
    Object.values(icon.variants).map((variant) => variant.source.split('/').at(-1)),
  ),
);
for (const file of await readdir(vendored)) {
  if (file.endsWith('.svg') && !expected.has(file)) await unlink(resolve(vendored, file));
}
console.log(
  `Pinned ${manifest.sourceCount} SVGs at ${revision}. Run node scripts/build/GenerateIcons.ts.`,
);
