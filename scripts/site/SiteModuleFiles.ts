import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type ViteManifest = Record<
  string,
  {
    file: string;
    src?: string;
    css?: string[];
    imports?: string[];
    dynamicImports?: string[];
    isEntry?: boolean;
    isDynamicEntry?: boolean;
  }
>;

export const moduleFilesName = 'module-files.json';

export function moduleFiles(manifest: ViteManifest): Record<string, string[]> {
  const closure = (key: string, seen = new Set<string>()): Set<string> => {
    if (seen.has(key) || !manifest[key]) return seen;
    seen.add(key);
    for (const imported of manifest[key].imports ?? []) closure(imported, seen);
    return seen;
  };
  const page = new Set<string>();
  for (const [key, chunk] of Object.entries(manifest)) if (chunk.isEntry) closure(key, page);
  const map: Record<string, string[]> = {};
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

export async function writeModuleFiles(siteDirectory: string) {
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
