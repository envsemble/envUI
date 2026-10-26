// The hosted site loads envUI's dev mode, `@envsemble/envui/dev`, on the Docs' dev mode page only:
// that page's demo (apps/site/src/demos/dev-mode/DevModeDemo.tsx) imports it lazily, and no
// other file holds any of it, not even the page's pictures of dev mode (DevModePictures.tsx).
// FinalizeSite.ts checks the build with checkDevModeChunks before it turns Vite's manifest into
// module-files.json.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/** The dev entry and the demo that loads it, as Vite's manifest keys them. */
export const devEntry = '../../packages/ui/src/dev.ts';
export const devModeDemo = 'src/demos/dev-mode/DevModeDemo.tsx';
/** Text only dev mode's own code holds: the attribute on the element its UI renders into. */
export const devMarker = 'data-env-dev-host';

/**
 * What is wrong with where the build put dev mode, as sentences; none when it is only in its own
 * chunks, which only the demo loads.
 *
 * @param {Record<string, { file: string, imports?: string[], dynamicImports?: string[], isEntry?: boolean, isDynamicEntry?: boolean }>} manifest
 * @param {Record<string, string>} contents Each JavaScript file of the build by its path, such as `assets/dev-1.js`.
 * @returns {string[]}
 */
export function devModeProblems(manifest, contents) {
  const problems: string[] = [];
  const dev = manifest[devEntry];
  if (!dev?.isDynamicEntry) return [`${devEntry} is not a chunk of its own that loads lazily.`];
  /** @param {string} key @param {Set<string>} seen */
  const closure = (key, seen = new Set()) => {
    if (seen.has(key) || !manifest[key]) return seen;
    seen.add(key);
    for (const imported of manifest[key].imports ?? []) closure(imported, seen);
    return seen;
  };
  // Dev mode's own chunks: what it imports that nothing else loads with it.
  const others = new Set();
  for (const [key, chunk] of Object.entries(manifest))
    if ((chunk.isEntry || chunk.isDynamicEntry) && key !== devEntry) closure(key, others);
  const own = [...closure(devEntry)].filter((key) => !others.has(key));
  const ownFiles = new Set(own.map((key) => manifest[key].file));

  for (const [key, chunk] of Object.entries(manifest))
    if (chunk.dynamicImports?.includes(devEntry) && key !== devModeDemo)
      problems.push(`${key} loads ${devEntry}; only ${devModeDemo} may.`);
  if (!manifest[devModeDemo]?.dynamicImports?.includes(devEntry))
    problems.push(`${devModeDemo} doesn't load ${devEntry} lazily.`);
  for (const key of Object.keys(manifest))
    if (key !== devEntry && closure(key).has(devEntry))
      problems.push(`${key} imports ${devEntry} with it, rather than lazily.`);
  for (const [file, text] of Object.entries(contents))
    if (text.includes(devMarker) && !ownFiles.has(file))
      problems.push(`${file} holds dev mode's code, outside the chunks only the demo loads.`);
  if (![...ownFiles].some((file) => contents[file]?.includes(devMarker)))
    problems.push(`None of dev mode's chunks holds ${devMarker}; update devMarker.`);
  return problems;
}

/**
 * Checks the hosted build in `siteDirectory` for dev mode outside the dev mode page, from Vite's
 * manifest; throws on a problem. A build already finalised, without its manifest, is left as it is.
 */
export async function checkDevModeChunks(siteDirectory) {
  const manifestFile = resolve(siteDirectory, '.vite/manifest.json');
  if (!existsSync(manifestFile)) return false;
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  const files = [...new Set(Object.values(manifest).map((chunk) => chunk.file))].filter((file) =>
    file.endsWith('.js'),
  );
  const contents = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => [file, await readFile(resolve(siteDirectory, file), 'utf8')]),
    ),
  );
  const problems = devModeProblems(manifest, contents);
  if (problems.length)
    throw new Error(
      `Dev mode must load on the dev mode page only:\n  - ${problems.join('\n  - ')}`,
    );
  return true;
}
