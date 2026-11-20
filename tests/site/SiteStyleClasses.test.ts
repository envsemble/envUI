import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { test } from 'node:test';
import postcss from 'postcss';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const siteFiles = async (pattern: string) => {
  const files: string[] = [];
  for await (const file of glob(pattern, { cwd: repositoryRoot })) files.push(file);
  return files.map((file) => ({ file, text: readFileSync(`${repositoryRoot}/${file}`, 'utf8') }));
};

const classesOf = (css: string) => {
  const classes = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/.test((rule.parent as postcss.AtRule).name))
      return;
    const selector = rule.selector.replace(/"[^"]*"|'[^']*'/g, '');
    for (const [, name] of selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) classes.add(name);
  });
  return classes;
};

test("each class the site's style sheets name is one the site's code writes", async () => {
  const sheets = await siteFiles('apps/site/src/**/*.css');
  const code = (await siteFiles('apps/site/src/**/*.{ts,tsx}')).map(({ text }) => text).join('\n');
  const prefixes = [...code.matchAll(/([a-z][a-z0-9-]*-)\$\{/g)].map(([, prefix]) => prefix);
  const words = new Set(code.match(/[\w-]+/g));
  const written = (name: string) =>
    words.has(name) || prefixes.some((prefix) => name.startsWith(prefix));
  const unwritten = sheets.flatMap(({ file, text }) =>
    [...classesOf(text)]
      .filter((name) => !name.startsWith('env-') && !written(name))
      .map((name) => `${file.replaceAll('\\', '/')}: .${name}`),
  );
  assert.deepEqual(
    unwritten,
    [],
    'Delete the rules of a class no site code writes, or write the class where the code builds it.',
  );
});
