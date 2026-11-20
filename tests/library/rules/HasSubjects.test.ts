import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import postcss from 'postcss';
import { repositoryRoot, styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

function sheetsIn(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return sheetsIn(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });
}

function split(selector, cut) {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let part = '';
  for (const char of selector) {
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (depth === 0 && cut(char)) {
      if (part.trim()) parts.push(part.trim());
      part = '';
      continue;
    }
    part += char;
  }
  if (part.trim()) parts.push(part.trim());
  return parts;
}

function named(compound) {
  if (/^:(?:where|is)\(/.test(compound)) return /[.#[]|^:(?:where|is)\([a-z]/i.test(compound);
  const outside = compound.replace(/\((?:[^()]|\([^()]*\))*\)/g, '()');
  return /^[a-z]/i.test(outside) || /[.#[]/.test(outside);
}

test('no :has() rule styles any element or a pseudo-element, which Chromium matches from every element', () => {
  const sheets = [
    ...sheetsIn(styleSheetsDirectory),
    ...sheetsIn(join(repositoryRoot, 'apps/site/src')),
  ];
  const found = [];
  for (const sheet of sheets)
    postcss.parse(readFileSync(sheet, 'utf8')).walkRules((rule) => {
      for (const selector of rule.selectors) {
        if (!selector.includes(':has(')) continue;
        const subject = split(selector, (char) => /[\s>+~]/.test(char)).at(-1) ?? '';
        if (subject.includes('::') || !named(subject)) {
          const file = relative(repositoryRoot, sheet).replaceAll('\\', '/');
          found.push(`${file}: ${selector.replace(/\s+/g, ' ')}`);
        }
      }
    });
  assert.deepEqual(found, []);
});
