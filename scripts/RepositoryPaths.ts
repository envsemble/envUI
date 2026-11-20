import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const at = (path: string) => resolve(repositoryRoot, path);
export const repositoryPath = (file: string) => relative(repositoryRoot, file).split(sep).join('/');

export const libraryDirectory = at('packages/ui');
export const librarySourceDirectory = at('packages/ui/src');
export const styleSheetsDirectory = at('packages/ui/src/styles');
export const libraryPackageFile = at('packages/ui/package.json');
export const libraryChangelogFile = at('packages/ui/CHANGELOG.md');
export const tokensDataFile = at('packages/ui/src/generated/tokens.json');

export const documentationDirectory = at('docs');
export const partsFile = at('docs/generated/parts.json');
export const propsFile = at('docs/generated/props.json');
export const exportsFile = at('docs/generated/exports.json');
export const examplesDirectory = at('apps/site/src/examples');
export const specimensDirectory = at('apps/site/src/specimens');
export const generatedDocumentationFile = at('apps/site/src/generated/Documentation.ts');
export const componentDurationsFile = at('tests/component/Durations.json');
