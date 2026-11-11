// The guides for contributors: their relative links.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { marked } from 'marked';

test("the contributor guides' relative links reach files, and headings, that exist", async () => {
  const { headingsOf } = await import('../../scripts/docs/MarkdownHeadings.ts');
  const guides = [
    'README.md',
    'CONTRIBUTING.md',
    'AGENTS.md',
    'packages/ui/AGENTS.md',
    'apps/site/AGENTS.md',
    'contributing/pages.md',
  ];
  const broken: string[] = [];
  for (const guide of guides) {
    const source = await readFile(resolve(guide), 'utf8');
    marked.walkTokens(marked.lexer(source), (token) => {
      if (token.type !== 'link' || /^[a-z][a-z\d+.-]*:/i.test(token.href)) return;
      const [path, fragment] = token.href.split('#');
      const target = path ? join(resolve(guide, '..'), path) : resolve(guide);
      if (!existsSync(target)) broken.push(`${guide}: ${token.href}`);
      else if (
        fragment &&
        !headingsOf(readFileSync(target, 'utf8')).some(({ id }) => id === fragment)
      )
        broken.push(`${guide}: ${token.href} names no heading`);
    });
  }
  assert.deepEqual(broken, []);
});
