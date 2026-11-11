// Where the repository's parts are, for the scripts and the tests: every path is absolute and from
// the repository's root, which this file's place in scripts/ gives.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const at = (path: string) => resolve(repositoryRoot, path);

/** The library's package, its sources, its manifest and its changelog. */
export const libraryDirectory = at('packages/ui');
export const librarySourceDirectory = at('packages/ui/src');
export const libraryPackageFile = at('packages/ui/package.json');
export const libraryChangelogFile = at('packages/ui/CHANGELOG.md');
/** The token build's data, which the search, the part outlines and the lint packages read. */
export const tokensDataFile = at('packages/ui/src/generated/tokens.json');

/** The documentation, and what its pages place: the site's example and specimen folders. */
export const documentationDirectory = at('docs');
export const examplesDirectory = at('apps/site/src/examples');
export const specimensDirectory = at('apps/site/src/specimens');
/** The catalogue's generated summary of the documentation, with its pages beside it. */
export const generatedDocumentationFile = at('apps/site/src/generated/Documentation.ts');
/** How long each component test file takes, by which CI splits them into shards. */
export const componentDurationsFile = at('tests/component/Durations.json');
