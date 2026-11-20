import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { codeText, listFiles } from '../support/SourceText.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const distinctiveNames = ['Atlas', 'Coord'];
const namesThatAreAlsoWordsOrCode = ['Console', 'Forms', 'Platform'];
const productNames = [
  ...distinctiveNames.map((name) => ({ name, flags: 'gi' })),
  ...namesThatAreAlsoWordsOrCode.map((name) => ({ name, flags: 'g' })),
];

const allowedEnglishUses: Record<string, RegExp[]> = {
  Forms: [/Forms & selection/g, /^#{2,} Forms$/g, /^- Forms, validation/g],
};

const allowedIn: Record<string, Record<string, RegExp[]>> = {
  'CONTRIBUTING.md': {},
};

type Source =
  { path: string; read: string } | { directory: string; extensions: string[]; read: string };

const sources: Source[] = [
  { path: 'README.md', read: 'whole' },
  { path: 'CONTRIBUTING.md', read: 'whole' },
  { path: 'AGENTS.md', read: 'whole' },
  { directory: 'contributing', extensions: ['.md'], read: 'whole' },
  { path: 'packages/ui/CHANGELOG.md', read: 'whole' },
  { directory: '.changeset', extensions: ['.md'], read: 'whole' },
  { directory: 'docs', extensions: ['.md'], read: 'whole' },
  { directory: 'packages/ui/src', extensions: ['.css'], read: 'whole' },
  { directory: 'packages/ui/src', extensions: ['.ts', '.tsx'], read: 'code' },
  { directory: 'apps/site/src', extensions: ['.ts', '.tsx'], read: 'code' },
  { directory: 'apps/site/src', extensions: ['.css'], read: 'whole' },
  { directory: 'apps/site/hosting', extensions: ['.mjs'], read: 'code' },
  { path: 'apps/site/hosting/_headers', read: 'whole' },
  { path: 'apps/site/hosting/SKILL.md', read: 'whole' },
  { directory: 'tests/fixture', extensions: ['.ts', '.tsx'], read: 'code' },
  { directory: 'tests/fixture', extensions: ['.css', '.html'], read: 'whole' },
  { path: 'packages/eslint-plugin/README.md', read: 'whole' },
  { path: 'packages/eslint-plugin/index.d.ts', read: 'code' },
  { directory: 'packages/eslint-plugin/src', extensions: ['.js'], read: 'code' },
  { directory: 'packages/eslint-plugin/src/data', extensions: ['.json'], read: 'whole' },
  { directory: 'packages/eslint-plugin/scripts', extensions: ['.mjs'], read: 'code' },
  { directory: 'packages/eslint-plugin/test', extensions: ['.mjs'], read: 'code' },
  { path: 'packages/stylelint-config/README.md', read: 'whole' },
  { directory: 'packages/stylelint-config/src', extensions: ['.js'], read: 'code' },
  { directory: 'packages/stylelint-config/src/data', extensions: ['.json'], read: 'whole' },
  { directory: 'packages/stylelint-config/test', extensions: ['.mjs'], read: 'code' },
];

const generated = [
  'packages/ui/src/icons/',
  'apps/site/src/brand/EnvUILogo.tsx',
  'apps/site/src/generated/',
];

test('shipped text, documentation and sample data name no products', async () => {
  const findings = [];
  for (const file of await sourceFiles()) {
    const text = await readFile(join(repositoryRoot, file.path), 'utf8');
    const segments = file.read === 'code' ? codeText(file.path, text) : [{ start: 0, text }];
    for (const segment of segments) findings.push(...productMentions(file.path, text, segment));
  }
  assert.deepEqual(findings, [], 'Name no products; describe the pattern instead.');
});

test('the check finds an application built on envUI and lets other products pass', () => {
  const text = '- Lay it out as Console does.\n- Follow the design system Material describes.\n';
  assert.deepEqual(productMentions('example.md', text, { start: 0, text }), [
    'example.md:1: Console in "- Lay it out as Console does."',
  ]);
  const forms = '- Forms & selection, then the list of Forms the team built.\n';
  assert.deepEqual(productMentions('example.md', forms, { start: 0, text: forms }), [
    'example.md:1: Forms in "- Forms & selection, then the list of Forms the team built."',
  ]);
  const cases = '- Plans live in ~/.atlas; the window chrome, a platform.\n';
  assert.deepEqual(productMentions('example.md', cases, { start: 0, text: cases }), [
    'example.md:1: Atlas in "- Plans live in ~/.atlas; the window chrome, a platform."',
  ]);
  const code = "// Unlike Coord.\nconsole.log('Atlas');\nimport { Forms } from './Forms';\n";
  const segments = codeText('example.ts', code);
  assert.deepEqual(
    segments.flatMap((segment) => productMentions('example.ts', code, segment)),
    ['example.ts:1: Coord in "// Unlike Coord."', `example.ts:2: Atlas in "'Atlas'"`],
  );
});

async function sourceFiles() {
  const files: { path: string; read: string }[] = [];
  for (const source of sources) {
    if ('path' in source) {
      files.push({ path: source.path, read: source.read });
      continue;
    }
    for (const path of await listFiles(source.directory)) {
      if (!source.extensions.some((extension) => path.endsWith(extension))) continue;
      if (generated.some((prefix) => path.startsWith(prefix))) continue;
      if (/(?:^|\/)(?:node_modules|dist)\//.test(path)) continue;
      files.push({ path, read: source.read });
    }
  }
  return files;
}

function productMentions(path: string, fileText: string, segment: { start: number; text: string }) {
  const mentions: string[] = [];
  const firstLine = fileText.slice(0, segment.start).split('\n').length;
  segment.text.split('\n').forEach((line, index) => {
    for (const { name, flags } of productNames) {
      for (const hit of line.matchAll(new RegExp(`\\b${name}\\b`, flags))) {
        const patterns = [...(allowedEnglishUses[name] ?? []), ...(allowedIn[path]?.[name] ?? [])];
        const covered = patterns.some((pattern) =>
          [...line.matchAll(pattern)].some(
            (use) => use.index <= hit.index && hit.index < use.index + use[0].length,
          ),
        );
        if (covered) continue;
        const excerpt = line
          .slice(Math.max(0, hit.index - 40), hit.index + name.length + 40)
          .trim();
        mentions.push(`${path}:${firstLine + index}: ${name} in "${excerpt}"`);
      }
    }
  });
  return mentions;
}
