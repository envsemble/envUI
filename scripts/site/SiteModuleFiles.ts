// The files behind each part of the hosted site that loads on its own, such as an example, its
// code or a specimen. When one fails to load, LoadBoundary's "Reload the page" fetches these files
// again before reloading: WebKit keeps a module that failed as failed for the whole tab, across
// reloads, until its file is fetched again.
//
// `vite build` writes Vite's manifest into dist/site/.vite/; FinalizeSite.ts turns it
// into dist/site/module-files.json with writeModuleFiles and removes the manifest.
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/** Where the map is served from, relative to the site's root. */
export const moduleFilesName = 'module-files.json';

/**
 * Maps each lazily loaded module of the catalogue's own source, by its path in the app such as
 * `src/examples/button/CreateProject.tsx` or `…CreateProject.tsx?raw`, to the files its load fetches:
 * its own chunk, and the chunks and styles it imports that the page has not loaded already.
 *
 * @param {Record<string, { file: string, src?: string, css?: string[], imports?: string[], isEntry?: boolean, isDynamicEntry?: boolean }>} manifest
 * @returns {Record<string, string[]>}
 */
export function moduleFiles(manifest) {
  /** @param {string} key @param {Set<string>} seen */
  const closure = (key, seen = new Set()) => {
    if (seen.has(key) || !manifest[key]) return seen;
    seen.add(key);
    for (const imported of manifest[key].imports ?? []) closure(imported, seen);
    return seen;
  };
  // What the entry loads arrives with the page, which would not run without it.
  const page = new Set();
  for (const [key, chunk] of Object.entries(manifest)) if (chunk.isEntry) closure(key, page);
  /** @type {Record<string, string[]>} */
  const map = {};
  for (const [key, chunk] of Object.entries(manifest)) {
    if (!chunk.isDynamicEntry || !key.startsWith('src/')) continue;
    const keys = [...closure(key)].filter((imported) => imported === key || !page.has(imported));
    map[key] = [
      ...new Set(
        keys.flatMap((imported) => [manifest[imported].file, ...(manifest[imported].css ?? [])]),
      ),
    ];
  }
  return map;
}

/**
 * Writes the map of the build in `siteDirectory` and removes Vite's manifest, which isn't served.
 * Resolves to true once written, and to false for a build that is already finalised, whose map
 * stays as it is: its manifest is gone, as after `npm run build:site`.
 */
export async function writeModuleFiles(siteDirectory) {
  const manifestDirectory = resolve(siteDirectory, '.vite');
  const manifestFile = resolve(manifestDirectory, 'manifest.json');
  if (!existsSync(manifestFile)) {
    if (existsSync(resolve(siteDirectory, moduleFilesName))) return false;
    throw new Error(
      `${siteDirectory} has neither Vite's manifest nor ${moduleFilesName}: build it with vite build, as npm run build:site does, first.`,
    );
  }
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  await writeFile(resolve(siteDirectory, moduleFilesName), JSON.stringify(moduleFiles(manifest)));
  await rm(manifestDirectory, { recursive: true });
  return true;
}
