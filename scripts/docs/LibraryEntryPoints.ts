// The library's public entry points, read from the exports of packages/ui/package.json: each
// subpath with a TypeScript source of its own, by the specifier applications import, in the
// manifest's order. A script that leaves some out or orders them says so where it reads them.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const libraryDirectory = fileURLToPath(new URL('../../packages/ui/', import.meta.url));

export interface LibraryEntryPoint {
  /** What applications import, such as @envsemble/envui/content. */
  specifier: string;
  /** Its TypeScript source, an absolute path. */
  file: string;
}

export function libraryEntryPoints(): LibraryEntryPoint[] {
  const manifest = JSON.parse(readFileSync(resolve(libraryDirectory, 'package.json'), 'utf8'));
  return Object.entries(
    manifest.exports as Record<string, string | Record<string, string>>,
  ).flatMap(([subpath, target]) => {
    const source = typeof target === 'object' ? target['envui-source'] : undefined;
    // The icons' pattern and the style sheet are files of their own, not modules of exports.
    if (!source || source.includes('*') || !/\.tsx?$/.test(source)) return [];
    return [
      { specifier: `@envsemble/envui${subpath.slice(1)}`, file: resolve(libraryDirectory, source) },
    ];
  });
}
