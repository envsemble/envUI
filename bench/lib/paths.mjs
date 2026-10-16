import { homedir } from 'node:os';
import { resolve } from 'node:path';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const separator = '[\\\\/]+';

/**
 * A regular expression source that matches an absolute path however a transcript spells it:
 * either separator, the doubled backslashes of JSON, and a Windows drive as `C:`, Git Bash's `/c`
 * or WSL's `/mnt/c`. Use it with the `i` flag; Windows paths are case-insensitive.
 */
export function pathPattern(path) {
  const parts = resolve(path)
    .split(/[\\/]+/)
    .filter(Boolean);
  let drive = '';
  if (/^[A-Za-z]:$/.test(parts[0] ?? '')) {
    const letter = parts.shift()[0];
    drive = `(?:\\b${letter}:|(?<![\\w.])/${letter}|/mnt/${letter})`;
  }
  return `${drive}${separator}${parts.map(escapeRegExp).join(separator)}`;
}

/** The end of a path segment: the path doesn't continue into a longer name. */
export const segmentEnd = '(?![\\w.-])';

/**
 * Rewrites local paths in a string: paths inside the run directory become relative to it, and the
 * rest of the user profile becomes `~`. Results that go into git then name no local user or folder.
 */
export function redactPaths(text, { runDir, home = homedir() }) {
  let result = text;
  if (runDir) result = result.replace(new RegExp(`${pathPattern(runDir)}${separator}`, 'gi'), '');
  if (home) result = result.replace(new RegExp(`${pathPattern(home)}${segmentEnd}`, 'gi'), '~');
  return result;
}

/** Applies `redactPaths` to every string in a JSON-like value. */
export function redactDeep(value, options) {
  if (typeof value === 'string') return redactPaths(value, options);
  if (Array.isArray(value)) return value.map((item) => redactDeep(item, options));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactDeep(item, options)]),
    );
  return value;
}

/** A short excerpt of a longer text, such as an agent's final message. */
export function excerpt(text, length = 280) {
  const flat = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return flat.length > length ? `${flat.slice(0, length - 1)}…` : flat;
}
