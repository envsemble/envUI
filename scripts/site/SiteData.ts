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
import { partKinds } from '../../apps/site/src/documentation/PartKeys.ts';

const partSizesFile = resolve(repositoryRoot, 'apps/site/src/generated/PartSizes.json');
function readPartSizes(): Record<string, [number, number]> {
  const { $comment: _comment, ...sizes } = JSON.parse(readFileSync(partSizesFile, 'utf8'));
  return sizes;
}

const pagePart = new RegExp(`^(?:${partKinds.join('|')}):([^/]+)/`);

const inside = (directory: string, path: string) => {
  const contained = relative(directory, path);
  return !contained.startsWith('..') && !isAbsolute(contained);
};

const resolvedId = (id: string) => `\0${id}`;

export function siteDataPlugins(): Plugin[] {
  let building = false;
  let pageParts: { sizes: Record<string, [number, number]>; lines: Record<string, number> } = {
    sizes: {},
    lines: {},
  };

  const siteData: Record<string, { read: () => unknown; sources: string[]; reloads?: false }> = {
    'virtual:envui-release-notes': { read: readReleaseNotes, sources: releaseNotesSources },
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
