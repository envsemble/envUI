// The data the site's pages read from the repository as the site app builds or serves
// (apps/site/vite.config.ts): the documentation's data, generated again as its sources change; the
// recorded sizes of the parts that load with a page and each example's lines of code, which their
// skeletons keep; and the release notes and the outlines of the parts, as virtual modules
// (`virtual:envui-*`, declared in apps/site/src/Vite.d.ts).
import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { generateDocumentation } from '../docs/GenerateDocumentation.ts';
import {
  documentationDirectory,
  examplesDirectory,
  repositoryRoot,
  specimensDirectory,
} from '../RepositoryPaths.ts';
import {
  changelogOutlineSources,
  exampleLinesSources,
  readChangelogOutline,
  readExampleLines,
  readTokenOutline,
  tokenOutlineSources,
} from './PartOutlines.ts';
import { readReleaseNotes, releaseNotesSources } from './ReleaseNotes.ts';

/** The recorded size of each part that loads with a page (scripts/site/RecordPartSizes.ts). */
const partSizesFile = resolve(repositoryRoot, 'apps/site/src/generated/PartSizes.json');
function readPartSizes(): Record<string, [number, number]> {
  const { $comment: _comment, ...sizes } = JSON.parse(readFileSync(partSizesFile, 'utf8'));
  return sizes;
}

/**
 * The key of a part of one page, an example, a specimen, the stage of an example shown open or a
 * guide's figure, with the page's id.
 */
const pagePart = /^(?:example|specimen|open|figure):([^/]+)\//;

/** Whether `path` is `directory` or inside it. */
const inside = (directory: string, path: string) => {
  const contained = relative(directory, path);
  return !contained.startsWith('..') && !isAbsolute(contained);
};

const resolvedId = (id: string) => `\0${id}`;

/** The plugins that give the site its data, in their order in the site's Vite config. */
export function siteDataPlugins(): Plugin[] {
  /** Whether the site is building rather than serving: set by envui-page-parts. */
  let building = false;
  /** Every part's size and every example's lines, read once a build. */
  let pageParts: { sizes: Record<string, [number, number]>; lines: Record<string, number> } = {
    sizes: {},
    lines: {},
  };

  /**
   * Data the site's pages read as virtual modules: the release notes, and the outlines of the
   * parts that load with a page, which their skeletons are drawn from. While serving, a change to
   * their files reloads the page with the new data; an outline (`reloads: false`), which only
   * shapes a skeleton, waits for the next load, so editing an example updates it in place.
   */
  const siteData: Record<string, { read: () => unknown; sources: string[]; reloads?: false }> = {
    'virtual:envui-release-notes': { read: readReleaseNotes, sources: releaseNotesSources },
    // In a build, a page's parts' sizes and lines go with its content (envui-page-parts), and the
    // site's start keeps only the sizes of parts of no one page.
    'virtual:envui-part-sizes': {
      read: () =>
        building
          ? Object.fromEntries(
              Object.entries(readPartSizes()).filter(([part]) => !pagePart.test(part)),
            )
          : readPartSizes(),
      sources: [partSizesFile],
      reloads: false,
    },
    'virtual:envui-example-lines': {
      read: () => (building ? {} : readExampleLines()),
      sources: exampleLinesSources,
      reloads: false,
    },
    'virtual:envui-changelog-outline': {
      read: readChangelogOutline,
      sources: changelogOutlineSources,
      reloads: false,
    },
    'virtual:envui-token-outline': {
      read: readTokenOutline,
      sources: tokenOutlineSources,
      reloads: false,
    },
  };

  return [
    {
      name: 'envui-documentation',
      buildStart() {
        generateDocumentation();
      },
      configureServer(server) {
        // Pages, generated props and the example and specimen files they reference.
        const sources = [documentationDirectory, examplesDirectory, specimensDirectory];
        server.watcher.add(sources);
        server.watcher.on('all', (event, path) => {
          if (
            !sources.some((source) => inside(source, path)) ||
            !['add', 'change', 'unlink'].includes(event)
          )
            return;
          try {
            generateDocumentation();
          } catch (error) {
            server.config.logger.error(String(error));
          }
        });
      },
    },
    {
      // Each page's content file carries the recorded sizes of its examples and specimens and
      // its examples' lines of code, which their skeletons keep, so the site's start doesn't
      // carry every page's (the virtual modules, while developing).
      name: 'envui-page-parts',
      apply: 'build',
      enforce: 'pre',
      config() {
        building = true;
      },
      buildStart() {
        pageParts = { sizes: readPartSizes(), lines: readExampleLines() };
      },
      transform(code, id) {
        const page = /\/src\/generated\/pages\/([^/]+)\.json$/.exec(id.split('?')[0] ?? '')?.[1];
        if (!page) return undefined;
        const { sizes, lines } = pageParts;
        const content = {
          ...JSON.parse(code),
          partSizes: Object.fromEntries(
            Object.entries(sizes).filter(([part]) => pagePart.exec(part)?.[1] === page),
          ),
          exampleLines: Object.fromEntries(
            Object.entries(lines).filter(([example]) => example.startsWith(`${page}/`)),
          ),
        };
        return { code: JSON.stringify(content), map: null };
      },
    },
    {
      name: 'envui-site-data',
      resolveId(id) {
        return Object.hasOwn(siteData, id) ? resolvedId(id) : undefined;
      },
      load(id) {
        const entry = Object.entries(siteData).find(([name]) => resolvedId(name) === id)?.[1];
        if (!entry) return undefined;
        return `export default ${JSON.stringify(entry.read())};`;
      },
      configureServer(server) {
        const sources = Object.values(siteData).flatMap((entry) => entry.sources);
        server.watcher.add(sources);
        server.watcher.on('all', (_event, path) => {
          for (const [name, { sources: files, reloads }] of Object.entries(siteData)) {
            const touched = files.some((source) => inside(source, path));
            const module = touched && server.moduleGraph.getModuleById(resolvedId(name));
            if (!module) continue;
            server.moduleGraph.invalidateModule(module);
            if (reloads !== false) server.ws.send({ type: 'full-reload' });
          }
        });
      },
    },
  ];
}
