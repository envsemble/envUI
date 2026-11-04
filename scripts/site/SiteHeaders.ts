// Reads apps/site/hosting/_headers, the response headers of the hosted site, as Cloudflare's
// asset server applies them: a rule is a path pattern followed by indented `Name: value` lines, and
// a response collects the headers of every rule matching its path, in order. `! Name` removes a
// header an earlier rule set. In a pattern, `*` matches any run of characters and `:name` one path
// segment. The tests serve the hosted build with these headers, so a header that breaks the site,
// such as framing that blocks the site's own frames, fails them as it would fail the site.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const headersFile = fileURLToPath(
  new URL('../../apps/site/hosting/_headers', import.meta.url),
);

/**
 * The rules of a _headers file, in order.
 * @param {string} text
 * @returns {{ pattern: string, set: [string, string][], remove: string[] }[]}
 */
export function parseHeaders(text: string) {
  const rules: { pattern: string; set: [string, string][]; remove: string[] }[] = [];
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

/** @param {string} pattern */
function patternExpression(pattern) {
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

/**
 * The headers the rules give a response for a path, with lowercase names.
 * @param {ReturnType<typeof parseHeaders>} rules
 * @param {string} pathname
 * @returns {Record<string, string>}
 */
export function headersFor(rules, pathname) {
  /** @type {Record<string, string>} */
  const headers = {};
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

/** The rules of the catalogue's _headers. */
export function siteHeaders(file = headersFile) {
  return parseHeaders(readFileSync(file, 'utf8'));
}
