// The files the hosted site serves to coding agents, at its root: SKILL.md, the setup skill that the
// Docs' home gives people a prompt for, and llms.txt, in the llmstxt.org format. Neither ships in
// the package, whose own docs/ agents read once envUI is installed.
//
// SKILL.md is apps/site/hosting/SKILL.md with the version of @envsemble/envui in place of
// {{version}}; llms.txt is a signpost, not another index: the Docs and the skill say the rest. The catalogue's Vite config serves both while developing and writes them into
// dist/site when it builds.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { libraryVersion, withLibraryVersion } from '../docs/LibraryVersions.ts';

export { libraryVersion };

const siteOrigin = 'https://envui.envsemble.com';
const skillTemplateFile = fileURLToPath(
  new URL('../../apps/site/hosting/SKILL.md', import.meta.url),
);
/** The setup skill for a version of envUI. */
export function renderSkill({
  version = libraryVersion(),
  template,
}: { version?: string; template?: string } = {}) {
  const source = (template ?? readFileSync(skillTemplateFile, 'utf8')).replace(/\r\n?/g, '\n');
  return withLibraryVersion(source, version);
}

/**
 * The site's llms.txt, for an agent that arrives at the site rather than at a project: what envUI
 * is, and where it reads on, the setup skill to install envUI, then the documentation that ships
 * with the installed version. It lists no pages, so nothing in it can fall out of step with them.
 */
export function renderLlmsText() {
  return [
    '# envUI',
    '',
    "> envUI is envsemble's React component library: components, design tokens and patterns for interfaces that work in light, dark and high contrast, with TypeScript declarations and documentation written for people and coding agents.",
    '',
    `- [Setup skill](${siteOrigin}/SKILL.md): installs envUI in a project with the user, points the project's AGENTS.md to its documentation and turns on its lint rules.`,
    '- Once envUI is installed, its documentation for the installed version is in `node_modules/@envsemble/envui/docs/`, starting at `docs/index.md`.',
    '',
  ].join('\n');
}

/** The files the site serves at its root, by name. */
export function siteAgentFiles() {
  return { 'SKILL.md': renderSkill(), 'llms.txt': renderLlmsText() };
}
