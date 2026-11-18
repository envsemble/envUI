import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { libraryDirectory } from '../RepositoryPaths.ts';

export interface LibraryEntryPoint {
  specifier: string;
  file: string;
}

export function libraryEntryPoints(): LibraryEntryPoint[] {
  const manifest = JSON.parse(readFileSync(resolve(libraryDirectory, 'package.json'), 'utf8'));
  return Object.entries(
    manifest.exports as Record<string, string | Record<string, string>>,
  ).flatMap(([subpath, target]) => {
    const source = typeof target === 'object' ? target['envui-source'] : undefined;
    if (!source || source.includes('*') || !/\.tsx?$/.test(source)) return [];
    return [
      { specifier: `@envsemble/envui${subpath.slice(1)}`, file: resolve(libraryDirectory, source) },
    ];
  });
}
