import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { librarySourceDirectory, repositoryRoot } from '../../RepositoryPaths.ts';

export const repositoryPath = (file: string) => relative(repositoryRoot, file).split(sep).join('/');

export function styleSheets() {
  const directory = resolve(librarySourceDirectory, 'styles');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.css'))
    .map((name) => ({
      path: repositoryPath(resolve(directory, name)),
      css: readFileSync(resolve(directory, name), 'utf8'),
    }));
}

export interface StateRecord {
  attribute: string;
  values?: Set<string>;
  classes?: string[];
  path: string;
}

export function isPrivateState(attribute: string) {
  return (
    attribute.startsWith('data-env-ssr-') ||
    attribute.startsWith('data-env-slot') ||
    attribute === 'data-env-theme-switching'
  );
}
