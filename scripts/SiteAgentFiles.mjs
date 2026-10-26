// The files the hosted site serves to coding agents, at its root: SKILL.md, the setup skill that the
// Docs' home gives people a prompt for, and llms.txt, the index of the Docs in the llmstxt.org
// format. Neither ships in the package, whose own docs/ agents read once envUI is installed.
//
// SKILL.md is apps/site/hosting/SKILL.md with the version of @envsemble/envui in place of
// {{version}}; llms.txt is generated from docs/index.md and each page's summary, linked to the
// site's pages. The catalogue's Vite config serves both while developing and writes them into
// dist/site when it builds.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readDocumentation } from './GenerateDocumentation.mjs';
import { unlistedPages } from './SearchIndex.mjs';

export const siteOrigin = 'https://envui.envsemble.com';
export const skillTemplateFile = fileURLToPath(
  new URL('../apps/site/hosting/SKILL.md', import.meta.url),
);
const libraryPackageFile = fileURLToPath(new URL('../packages/ui/package.json', import.meta.url));

/** The version of @envsemble/envui, which the skill installs. */
export const libraryVersion = () => JSON.parse(readFileSync(libraryPackageFile, 'utf8')).version;

/** The setup skill for a version of envUI. */
export function renderSkill({ version = libraryVersion(), template } = {}) {
  const source = (template ?? readFileSync(skillTemplateFile, 'utf8')).replace(/\r\n?/g, '\n');
  return source.replaceAll('{{version}}', version);
}

/** The site's address of a page of docs/, such as components/button.md: its page in the Docs. */
export const pageUrl = (path) => `${siteOrigin}/docs/${path.replace(/\.md$/, '')}`;

/** The pages of the Docs that no file in docs/ writes, linked under Optional. */
const sitePages = [
  [
    'Design tokens',
    'docs/tokens',
    'Every token as a CSS custom property, with its value in each theme and scale.',
  ],
  [
    'Codemods',
    'docs/codemods',
    'Upgrade an application from envUI 0.x to 1.0 with @envsemble/envui-codemods.',
  ],
  ['Changelog', 'docs/changelog', 'What changed in each release, with how to migrate.'],
];

/** The site's llms.txt: what envUI is, the setup skill, and every page of the Docs by group. */
export function renderLlmsText({ documents = readDocumentation() } = {}) {
  const lines = [
    '# envUI',
    '',
    "> envUI is envsemble's React component library: components, design tokens and patterns for interfaces that work in light, dark and high contrast, with TypeScript declarations and documentation written for people and coding agents.",
    '',
    `To set envUI up in a project, follow the setup skill below with the user. Once envUI is installed, its documentation for the installed version is in \`node_modules/@envsemble/envui/docs/\`, starting at \`docs/index.md\`; prefer it to these pages, which follow the latest release.`,
    '',
    '## Agent setup',
    '',
    `- [Setup skill](${siteOrigin}/SKILL.md): installs envUI, points the project's AGENTS.md to its docs and turns on its lint rules, with the user.`,
    '',
  ];
  const groups = new Map();
  for (const document of documents) {
    if (unlistedPages.has(document.id)) continue;
    groups.set(document.group, [...(groups.get(document.group) ?? []), document]);
  }
  for (const [group, entries] of groups) {
    const heading = ['Setup and workflows', 'Foundations', 'Patterns'].includes(group)
      ? group
      : `Components: ${group}`;
    lines.push(`## ${heading}`, '');
    for (const { title, path, summary } of entries)
      lines.push(`- [${title}](${pageUrl(path)})${summary ? `: ${summary}` : ''}`);
    lines.push('');
  }
  lines.push('## Optional', '');
  for (const [title, path, summary] of sitePages)
    lines.push(`- [${title}](${siteOrigin}/${path}): ${summary}`);
  return `${lines.join('\n')}\n`;
}

/** The files the site serves at its root, by name. */
export function siteAgentFiles() {
  return { 'SKILL.md': renderSkill(), 'llms.txt': renderLlmsText() };
}
