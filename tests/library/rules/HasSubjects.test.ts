import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import postcss from 'postcss';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

// Chromium matches a :has() rule whose subject is any element (`> *`, `> :first-child`) or a
// pseudo-element from every element, so anything that changes anywhere on the page, such as a node
// added, has it work out the style of the whole page again (packages/ui/AGENTS.md, Style sheets).
// This test reads the library's and the site's style sheets and rejects such a rule.

/** The style sheets of a folder and the folders in it. */
function sheetsIn(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return sheetsIn(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });
}

/** A selector's parts at its top level, cut where `cut` holds, outside brackets and quotes. */
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

/** Whether a compound names its element: a type, class, id or attribute, or a list of them. */
function named(compound) {
  if (/^:(?:where|is)\(/.test(compound)) return /[.#[]|^:(?:where|is)\([a-z]/i.test(compound);
  const outside = compound.replace(/\((?:[^()]|\([^()]*\))*\)/g, '()');
  return /^[a-z]/i.test(outside) || /[.#[]/.test(outside);
}

test('no :has() rule styles any element or a pseudo-element', () => {
  const sheets = [
    ...sheetsIn(join(repositoryRoot, 'packages/ui/src/styles')),
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
