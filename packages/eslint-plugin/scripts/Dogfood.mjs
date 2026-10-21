// Counts what the recommended config reports in envUI's own catalogue and test fixture, without
// enforcing it: they render raw elements and the library's classes on purpose. The counts show how
// the rules behave on real envUI code, and what is left of the old names after the renames.
//
//   node scripts/Dogfood.mjs [directory …]   default: apps/catalogue/src tests/fixture

import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import plugin from '../src/index.js';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const directories =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : ['apps/catalogue/src', 'tests/fixture'];

const eslint = new ESLint({
  cwd: repository,
  overrideConfigFile: true,
  overrideConfig: [
    { ignores: ['**/generated/**'] },
    {
      files: ['**/*.{ts,tsx,mts,cts}'],
      languageOptions: { parser: tseslint.parser },
    },
    // The repository's own disable comments name rules this run does not load.
    { linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'off' } },
    plugin.configs.recommended,
  ],
});

/** What a message is about: the element, class, color or name, for grouping. */
function subject(ruleId, message) {
  const patterns = {
    'envui/no-hand-rolled-layout':
      /^Inline `display: ([\w-]+)` lays out (a row or a column|a row|a column|a grid)/,
    'envui/no-html-elements': /^Use envUI's (\S+) instead of (.+?)(?:, or |: import)/,
    'envui/no-private-classes': /^(\S+)/,
    'envui/no-raw-colors': /^Raw color (.+) in an inline style/,
    'envui/no-renamed-exports': /^(?:In envUI 1\.0 )?(\S+)/,
  };
  const match = message.match(patterns[ruleId]);
  if (!match) return message;
  if (ruleId === 'envui/no-hand-rolled-layout') return `${match[1]} (${match[2]})`;
  return ruleId === 'envui/no-html-elements' ? `${match[2]} -> ${match[1]}` : match[1];
}

const counts = new Map();
let files = 0;
for (const directory of directories) {
  const results = await eslint.lintFiles([`${directory}/**/*.{js,jsx,mjs,ts,tsx}`]);
  files += results.length;
  for (const result of results)
    for (const { ruleId, message } of result.messages) {
      if (!ruleId?.startsWith('envui/')) continue;
      const byRule = counts.get(ruleId) ?? {
        total: 0,
        byDirectory: new Map(),
        bySubject: new Map(),
      };
      byRule.total += 1;
      byRule.byDirectory.set(directory, (byRule.byDirectory.get(directory) ?? 0) + 1);
      const about = subject(ruleId, message);
      byRule.bySubject.set(about, (byRule.bySubject.get(about) ?? 0) + 1);
      counts.set(ruleId, byRule);
    }
}

console.log(`Linted ${files} files in ${directories.join(', ')} with envui/recommended.\n`);
for (const ruleId of Object.keys(plugin.configs.recommended.rules)) {
  const { total = 0, byDirectory = new Map(), bySubject = new Map() } = counts.get(ruleId) ?? {};
  const where = directories.map((directory) => `${directory} ${byDirectory.get(directory) ?? 0}`);
  console.log(`${ruleId}: ${total} (${where.join(', ')})`);
  for (const [about, count] of [...bySubject].sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(count).padStart(5)}  ${about}`);
}
