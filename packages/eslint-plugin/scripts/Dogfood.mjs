import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import plugin from '../src/index.js';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const directories =
  process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['apps/site/src', 'tests/fixture'];

const ignoreDisableCommentsForUnloadedRules = {
  linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'off' },
};

const eslint = new ESLint({
  cwd: repository,
  overrideConfigFile: true,
  overrideConfig: [
    { ignores: ['**/generated/**'] },
    {
      files: ['**/*.{ts,tsx,mts,cts}'],
      languageOptions: { parser: tseslint.parser },
    },
    ignoreDisableCommentsForUnloadedRules,
    plugin.configs.recommended,
  ],
});

function groupingSubject(ruleId, message) {
  const patterns = {
    'envui/no-html-elements': /^Use envUI's (\S+) instead of (.+?)(?:, or |: import)/,
    'envui/no-raw-colors': /^Raw color (.+) in an inline style/,
    'envui/no-link-in-clickable-row': /^(.+?) inside a clickable (\S+):/,
    'envui/no-field-in-list-row': /^A (\S+) with no label in a List\.Item's/,
    'envui/label-vocabulary': /instead of "(.+)"\.$/,
    'envui/no-raw-graphics':
      /^(Use envUI's Graphic instead of a raw <img>|A raw <svg [^>]*>|Graphic needs alt|A negative margin on a Graphic|A <[^>]+> from \S+)/,
  };
  const match = message.match(patterns[ruleId]);
  if (!match) return message;
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
      const about = groupingSubject(ruleId, message);
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
