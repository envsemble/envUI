import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repositoryRoot } from '../RepositoryPaths.ts';

const headersFile = resolve(repositoryRoot, 'apps/site/hosting/_headers');

interface HeaderRule {
  pattern: string;
  set: [string, string][];
  remove: string[];
}

export function parseHeaders(text: string) {
  const rules: HeaderRule[] = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      rules.push({ pattern: line.trim(), set: [], remove: [] });
      continue;
    }
    const rule = rules.at(-1);
    if (!rule) throw new Error(`_headers line ${index + 1} sets a header before any path.`);
    const entry = line.trim();
    if (entry.startsWith('!')) {
      rule.remove.push(entry.slice(1).trim());
      continue;
    }
    const colon = entry.indexOf(':');
    if (colon <= 0) throw new Error(`_headers line ${index + 1} is not "Name: value": ${entry}`);
    rule.set.push([entry.slice(0, colon).trim(), entry.slice(colon + 1).trim()]);
  }
  return rules;
}

function patternExpression(pattern: string) {
  const source = pattern
    .split(/(\*|:[A-Za-z]\w*)/)
    .map((part) => {
      if (part === '*') return '.*';
      if (part.startsWith(':')) return '[^/]+';
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${source}$`);
}

export function headersFor(rules: HeaderRule[], pathname: string) {
  const headers: Record<string, string> = {};
  for (const rule of rules) {
    if (!patternExpression(rule.pattern).test(pathname)) continue;
    for (const name of rule.remove) delete headers[name.toLowerCase()];
    for (const [name, value] of rule.set) {
      const key = name.toLowerCase();
      headers[key] = headers[key] === undefined ? value : `${headers[key]}, ${value}`;
    }
  }
  return headers;
}

export function siteHeaders(file = headersFile) {
  return parseHeaders(readFileSync(file, 'utf8'));
}
