import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { repositoryRoot } from '../RepositoryPaths.ts';

export const browserTestsDirectory = 'tests/browser';

const browserTestFolders = [
  [`${browserTestsDirectory}/library`, '.spec.ts'],
  [`${browserTestsDirectory}/site`, '.spec.ts'],
  ['tests/component', '.test.tsx'],
] as const;

export function browserTestPaths(root = repositoryRoot) {
  const paths = new Map<string, string>();
  for (const [folder, ending] of browserTestFolders) {
    const directory = resolve(root, folder);
    if (!existsSync(directory)) continue;
    for (const file of readdirSync(directory))
      if (file.endsWith(ending)) paths.set(file.slice(0, -ending.length), `${folder}/${file}`);
  }
  return paths;
}

export const browserTestFile = (name: string, root = repositoryRoot) =>
  browserTestPaths(root).get(name) ?? `${browserTestsDirectory}/library/${name}.spec.ts`;

export const isComponentTest = (path: string) => path.endsWith('.test.tsx');
