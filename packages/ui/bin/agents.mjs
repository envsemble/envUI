// `envui agents`: writes a compressed index of envUI into the project's AGENTS.md, between
// BEGIN envui and END envui markers, from the installed package's manifest. Coding agents read
// AGENTS.md at the start of every task, so the index puts the rule "search envUI first" and the way
// to the installed documentation in front of them without a tool call.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { topLevelExports } from './catalog.mjs';

export const beginMarker = '<!-- BEGIN envui -->';
export const endMarker = '<!-- END envui -->';
/** The index's budget in bytes, markers included: small enough to read on every task. */
export const indexBudget = 8 * 1024;

const docsPath = 'node_modules/@envsemble/envui/docs';

/**
 * A component page as one entry of the index: its file, its exports and, budget allowing, the
 * first few aliases, such as `button.md Button IconButton ConfirmButton (action, CTA)`.
 */
function pageEntry(component, aliasCount) {
  const names = topLevelExports(component).map((entry) => entry.name);
  const known = new Set(names.map((name) => name.toLowerCase()));
  const aliases = component.aliases
    .filter((alias) => {
      const key = alias.toLowerCase();
      if (known.has(key)) return false;
      known.add(key);
      return true;
    })
    .slice(0, aliasCount);
  return `${component.page}: ${names.join(' ')}${aliases.length ? ` (${aliases.join(', ')})` : ''}`;
}

/** The index between its markers, with as many aliases per page as the budget allows. */
export function renderIndex(manifest, { budget = indexBudget } = {}) {
  for (let aliasCount = 6; aliasCount >= 0; aliasCount -= 1) {
    const block = renderBlock(manifest, aliasCount);
    if (Buffer.byteLength(block) <= budget) return block;
  }
  throw new Error(`The envUI index does not fit in ${budget} bytes even without aliases.`);
}

function renderBlock(manifest, aliasCount) {
  const version = manifest.version ? ` ${manifest.version}` : '';
  const lines = [
    beginMarker,
    `<!-- Written by \`npx envui agents\` from ${manifest.package}${version}. Run it again after upgrading; edit outside the markers. -->`,
    '',
    '## envUI',
    '',
    `This project's UI is built with envUI (\`${manifest.package}\`${version}), a React design system.`,
    '',
    `- **${manifest.rule}** Never hand-roll a button, field, menu, dialog, table, tabs or layout that envUI has, and never restyle its \`.env-*\` classes. What envUI lacks, compose from its parts for now and propose upstream.`,
    '- Look things up with the `envui` MCP tools when they are available: `plan` for a whole screen, `search`, `get_component`, `get_props`, `get_example`, `get_tokens`. Otherwise read the docs below; use only the exports and props they or the `.d.ts` files list.',
    `- Docs in \`${docsPath}/\`: \`index.md\`; \`components/<page>.md\` with when to use it and what instead, accessibility, examples and props; \`examples/<page>/<Name>.tsx\`; \`foundations/\`; \`patterns/\`; \`setup.md\`. The same as data in \`node_modules/@envsemble/envui/manifest.json\`, and all pages in one file in \`llms-full.txt\` beside it.`,
    `- Imports: ${manifest.imports.entryPoints.map((entry) => `\`${entry}\``).join(', ')}; icons one by one from \`${manifest.imports.icons}\` (names in \`icon-manifest.json\`); \`${manifest.imports.styles}\` once, and the UI inside \`Theme\`.`,
    '- Style with tokens, as CSS custom properties such as `var(--color-fg-muted)` or `var(--space-4)`: no raw colors or pixel sizes.',
    '',
    `### Components: \`components/<page>.md\`: exports (also known as)`,
    '',
  ];
  for (const category of manifest.categories) {
    const entries = manifest.components
      .filter((component) => component.category === category)
      .map((component) => pageEntry(component, aliasCount));
    lines.push(`- ${category}: ${entries.join('; ')}`);
  }
  const pageList = (pages) => pages.map((page) => page.name).join(', ');
  const others = Object.entries(manifest.exports).filter(
    ([name, entry]) =>
      !name.includes('.') && !manifest.components.some((c) => c.page === entry.page),
  );
  const byPage = new Map();
  for (const [name, entry] of others)
    byPage.set(entry.page, [...(byPage.get(entry.page) ?? []), name]);
  if (byPage.size)
    lines.push(
      `- Other exports: ${[...byPage]
        .map(([page, names]) => {
          const doc =
            page && [...manifest.guides, ...manifest.foundations].find((p) => p.name === page);
          return `${names.join(' ')}${doc ? ` (${doc.doc.replace(/^docs\//, '')})` : ''}`;
        })
        .join('; ')}`,
    );
  lines.push('');
  if (manifest.patterns.length)
    lines.push(`Patterns, \`patterns/<name>.md\`: ${pageList(manifest.patterns)}.`);
  if (manifest.templates.length)
    lines.push(`Templates, \`templates/<name>.md\`: ${pageList(manifest.templates)}.`);
  if (manifest.foundations.length)
    lines.push(`Foundations, \`foundations/<name>.md\`: ${pageList(manifest.foundations)}.`);
  lines.push(endMarker);
  return `${lines.join('\n')}\n`;
}

/**
 * The file with the index in place: replacing the block between the markers, or appended when it
 * has none. The rest of the file and its line endings stay as they are.
 */
export function withIndex(source, block) {
  const newline = /\r\n/.test(source) ? '\r\n' : '\n';
  const text = block.replace(/\r?\n/g, newline);
  const begin = source.indexOf(beginMarker);
  const end = source.indexOf(endMarker);
  if (begin === -1 && end === -1) {
    if (!source.trim()) return text;
    const trimmed = source.replace(/(?:\r?\n)*$/, '');
    return `${trimmed}${newline}${newline}${text}`;
  }
  if (begin === -1 || end === -1 || end < begin || source.indexOf(beginMarker, begin + 1) !== -1)
    throw new Error(
      `The file has ${begin === -1 ? `no ${beginMarker}` : end === -1 ? `no ${endMarker}` : 'its envui markers out of order or twice'}; fix the markers by hand, or remove the block, and run again.`,
    );
  let after = end + endMarker.length;
  if (source.startsWith('\r\n', after)) after += 2;
  else if (source.startsWith('\n', after)) after += 1;
  return `${source.slice(0, begin)}${text}${source.slice(after)}`;
}

/** Writes or checks the index in a file; returns what happened and the exit code. */
export function updateAgentsFile(file, manifest, { check = false, label = file } = {}) {
  const exists = existsSync(file);
  const source = exists ? readFileSync(file, 'utf8') : '';
  const block = renderIndex(manifest);
  const next = withIndex(source, block);
  const bytes = Buffer.byteLength(block);
  if (check) {
    if (next === source) return { code: 0, message: `${label} has the current envUI index.` };
    return {
      code: 1,
      message: `${label} ${exists ? 'has an outdated envUI index, or none' : 'does not exist'}. Run \`npx envui agents\` and commit the result.`,
    };
  }
  if (next === source)
    return { code: 0, message: `${label} already has the current envUI index (${bytes} bytes).` };
  writeFileSync(file, next);
  return {
    code: 0,
    message: `${exists ? 'Updated' : 'Created'} ${label} with the envUI index (${bytes} bytes).`,
  };
}

export const agentsUsage = `Usage: envui agents [--check] [--file <path>] [--print]

Writes a compressed index of envUI into AGENTS.md in the current folder, between
${beginMarker} and ${endMarker}. It keeps the rest of the file, replaces an earlier index and
creates the file when it is missing.

Options:
  --check        Change nothing; exit with 1 when the index is missing or outdated, as in CI.
  --file <path>  Write to another file, such as CLAUDE.md, instead of AGENTS.md.
  --print        Print the index instead of writing it.`;

export function runAgents(options, manifest) {
  if (options.print) {
    process.stdout.write(renderIndex(manifest));
    return 0;
  }
  const file = resolve(process.cwd(), options.file ?? 'AGENTS.md');
  const { code, message } = updateAgentsFile(file, manifest, {
    check: options.check,
    label: relative(process.cwd(), file) || file,
  });
  (code ? console.error : console.log)(message);
  return code;
}
