import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ViteManifest } from './SiteModuleFiles.ts';

export const devEntry = '../../packages/ui/src/dev.ts';
export const devModeFigures = 'src/figures/dev-mode/DevModeFigures.ts';
export const devMarker = 'data-env-dev-host';

export function devModeProblems(
  manifest: ViteManifest,
  contents: Record<string, string>,
): string[] {
  const problems: string[] = [];
  const dev = manifest[devEntry];
  if (!dev?.isDynamicEntry) return [`${devEntry} is not a chunk of its own that loads lazily.`];
  const closure = (key: string, seen = new Set<string>()): Set<string> => {
    if (seen.has(key) || !manifest[key]) return seen;
    seen.add(key);
    for (const imported of manifest[key].imports ?? []) closure(imported, seen);
    return seen;
  };
  const others = new Set<string>();
  for (const [key, chunk] of Object.entries(manifest))
    if ((chunk.isEntry || chunk.isDynamicEntry) && key !== devEntry) closure(key, others);
  const own = [...closure(devEntry)].filter((key) => !others.has(key));
  const ownFiles = new Set(own.map((key) => manifest[key].file));

  for (const [key, chunk] of Object.entries(manifest))
    if (chunk.dynamicImports?.includes(devEntry) && key !== devModeFigures)
      problems.push(`${key} loads ${devEntry}; only ${devModeFigures} may.`);
  if (!manifest[devModeFigures]?.dynamicImports?.includes(devEntry))
    problems.push(`${devModeFigures} doesn't load ${devEntry} lazily.`);
  for (const key of Object.keys(manifest))
    if (key !== devEntry && closure(key).has(devEntry))
      problems.push(`${key} imports ${devEntry} with it, rather than lazily.`);
  for (const [file, text] of Object.entries(contents))
    if (text.includes(devMarker) && !ownFiles.has(file))
      problems.push(
        `${file} holds dev mode's code, outside the chunks only the dev mode page's figures load.`,
      );
  if (![...ownFiles].some((file) => contents[file]?.includes(devMarker)))
    problems.push(`None of dev mode's chunks holds ${devMarker}; update devMarker.`);
  return problems;
}

export async function checkDevModeChunks(siteDirectory: string) {
  const manifestFile = resolve(siteDirectory, '.vite/manifest.json');
  if (!existsSync(manifestFile)) return false;
  const manifest: ViteManifest = JSON.parse(await readFile(manifestFile, 'utf8'));
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
