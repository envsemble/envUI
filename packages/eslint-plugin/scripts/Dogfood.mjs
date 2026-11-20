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
    plugin.configs.strict,
  ],
});

function groupingSubject({ messageId, line, column, endLine, endColumn }, source) {
  const lines = source.split(/\r?\n/);
  const reported =
    endLine === line
      ? lines[line - 1].slice(column - 1, endColumn - 1)
      : lines[line - 1].slice(column - 1);
  return `${messageId}: ${reported.trim().replace(/\s+/g, ' ').slice(0, 60)}`;
}

const counts = new Map();
let files = 0;
for (const directory of directories) {
  const results = await eslint.lintFiles([`${directory}/**/*.{js,jsx,mjs,ts,tsx}`]);
  files += results.length;
  for (const result of results)
    for (const problem of result.messages) {
      const { ruleId } = problem;
      if (!ruleId?.startsWith('envui/')) continue;
      const byRule = counts.get(ruleId) ?? {
        total: 0,
        byDirectory: new Map(),
        bySubject: new Map(),
      };
      byRule.total += 1;
      byRule.byDirectory.set(directory, (byRule.byDirectory.get(directory) ?? 0) + 1);
      const about = groupingSubject(problem, result.source);
      byRule.bySubject.set(about, (byRule.bySubject.get(about) ?? 0) + 1);
      counts.set(ruleId, byRule);
    }
}

console.log(`Linted ${files} files in ${directories.join(', ')} with envui/strict.\n`);
for (const ruleId of Object.keys(plugin.configs.strict.rules)) {
  const { total = 0, byDirectory = new Map(), bySubject = new Map() } = counts.get(ruleId) ?? {};
  const where = directories.map((directory) => `${directory} ${byDirectory.get(directory) ?? 0}`);
  console.log(`${ruleId}: ${total} (${where.join(', ')})`);
  for (const [about, count] of [...bySubject].sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(count).padStart(5)}  ${about}`);
}
