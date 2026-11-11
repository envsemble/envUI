// What the part contract reads in the library: where its source and style sheets are, and the state
// attributes each extraction finds.
import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { librarySourceDirectory, repositoryRoot } from '../../RepositoryPaths.ts';

/** A file's path from the repository's root, with forward slashes. */
export const repositoryPath = (file: string) => relative(repositoryRoot, file).split(sep).join('/');

/** The library's style sheets, src/styles/*.css, each with its repository path and its text. */
export function styleSheets() {
  const directory = resolve(librarySourceDirectory, 'styles');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.css'))
    .map((name) => ({
      path: repositoryPath(resolve(directory, name)),
      css: readFileSync(resolve(directory, name), 'utf8'),
    }));
}

/** A data attribute a part takes: its values, the classes of its element, and where it is set. */
export interface StateRecord {
  attribute: string;
  /** Undefined where its values can't be listed, such as a number. */
  values?: Set<string>;
  classes?: string[];
  path: string;
}

/**
 * Whether a state attribute is private: data-env-ssr-*, which server markup carries only until a
 * component reads its layout in the browser, such as a dock that stacks before it hydrates. Neither
 * the contract nor the docs list them, and they may change in any release. So is
 * data-env-theme-switching, which ThemePreferenceProvider sets on the themed root for the frame a
 * theme switch restyles, pausing transitions.
 */
export function isPrivateState(attribute: string) {
  return attribute.startsWith('data-env-ssr-') || attribute === 'data-env-theme-switching';
}
