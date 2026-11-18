import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { libraryVersion, withLibraryVersion } from '../docs/LibraryVersions.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

export { libraryVersion };

export const siteOrigin = 'https://envui.envsemble.com';
const skillTemplateFile = resolve(repositoryRoot, 'apps/site/hosting/SKILL.md');
export function renderSkill({
  version = libraryVersion(),
  template,
}: { version?: string; template?: string } = {}) {
  const source = (template ?? readFileSync(skillTemplateFile, 'utf8')).replace(/\r\n?/g, '\n');
  return withLibraryVersion(source, version);
}

export function renderLlmsText() {
  return [
    '# envUI',
    '',
    "> envUI is envsemble's React component library: components and design tokens for interfaces that work in light, dark and high contrast, with TypeScript declarations and documentation written for people and coding agents.",
    '',
    `- [Setup skill](${siteOrigin}/SKILL.md): installs envUI in a project with the user, points the project's AGENTS.md to its documentation and turns on its lint rules.`,
    '- Once envUI is installed, its documentation for the installed version is in `node_modules/@envsemble/envui/docs/`, starting at `docs/index.md`.',
    '',
  ].join('\n');
}

function siteAgentFiles() {
  return { 'SKILL.md': renderSkill(), 'llms.txt': renderLlmsText() };
}

const agentFileTypes = {
  'SKILL.md': 'text/markdown; charset=utf-8',
  'llms.txt': 'text/plain; charset=utf-8',
};

export const agentFilesPlugin = (): Plugin => ({
  name: 'envui-agent-files',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const name = request.url?.split('?')[0]?.slice(1) ?? '';
      if (!Object.hasOwn(agentFileTypes, name)) return next();
      const file = name as keyof typeof agentFileTypes;
      response.setHeader('Content-Type', agentFileTypes[file]);
      response.end(siteAgentFiles()[file]);
    });
  },
  generateBundle() {
    for (const [fileName, source] of Object.entries(siteAgentFiles()))
      this.emitFile({ type: 'asset', fileName, source });
  },
});
