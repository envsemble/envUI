import { existsSync, readFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import { pathPattern, redactPaths, segmentEnd } from './paths.mjs';
import { run } from './process.mjs';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isWithin = (child, parent) => {
  const path = relative(resolve(parent), resolve(child));
  return path === '' || (!path.startsWith('..') && !isAbsolute(path));
};
/** A whole path segment: after a separator, quote or space, and before the same. */
const segment = (name) => `(?<=^|[\\\\/"'\`\\s=:])${escapeRegExp(name)}(?=[\\\\/"'\`\\s:;,)]|$)`;
const pathSegment = '([\\w.@+-]+)';
/** A line break right after a match, raw or JSON-escaped: consoles wrap long paths. */
const wrapsAt = (text, index) => /^(?:\r|\n|\\r|\\n)/.test(text.slice(index, index + 2));

/** Folder names of the repository's checkouts: the main one and every worktree. */
function checkoutNames(repoDir) {
  const names = new Set([basename(repoDir)]);
  try {
    const output = run('git', ['worktree', 'list', '--porcelain'], { cwd: repoDir });
    for (const line of output.split(/\r?\n/))
      if (line.startsWith('worktree ')) names.add(basename(line.slice('worktree '.length)));
  } catch {
    // Not a git checkout; the directory's own name is enough.
  }
  return names;
}

/**
 * What an agent's transcript must not mention: the source checkout and the folder it sits in,
 * the checkouts' folder names, extra paths such as the user's notes, and the other runs of the
 * same benchmark (their workspaces, temp folders and logs).
 */
export function auditMarkers({ repoDir, runDir, jobNames = [], extraPaths = [] }) {
  const markers = [];
  const roots = new Set([dirname(resolve(repoDir))]);
  // The checkout's top-level folder, such as C:\Dev, unless it also holds the user profile or the
  // temp folder: C:\Users would match every workspace.
  const { root } = parse(resolve(repoDir));
  const top = resolve(root, relative(root, resolve(repoDir)).split(sep)[0]);
  if (top !== resolve(repoDir) && !isWithin(homedir(), top) && !isWithin(tmpdir(), top))
    roots.add(top);
  for (const path of [...roots, ...extraPaths]) {
    const label = redactPaths(resolve(path), {});
    markers.push({ label, regex: new RegExp(`${pathPattern(path)}${segmentEnd}`, 'i') });
    // Claude Code names its per-project folders after the path, as in C--Dev-workspace.
    const flattened = resolve(path).replace(/[:\\/]/g, '-');
    markers.push({ label, regex: new RegExp(`${escapeRegExp(flattened)}(?![\\w.])`, 'i') });
  }
  // The main checkout is named after the library, and so is a folder inside the installed package
  // (assets/envUI), so that name only counts as part of the paths above. Worktree names are distinct.
  for (const name of checkoutNames(repoDir))
    if (name.toLowerCase() !== 'envui')
      markers.push({ label: `checkout ${name}`, regex: new RegExp(segment(name), 'i') });
  return { markers, runDir: runDir && resolve(runDir), jobNames };
}

/**
 * Scans what an agent printed and called (its transcript, stderr and final message) for the
 * markers. A hit means the run read, ran or was shown something outside its own workspace that
 * can tell it about envUI's source or about another run, so the run is flagged as escaped.
 */
export function auditRun({ files, audit, name }) {
  const hits = [];
  const ownName = name.toLowerCase();
  const others = new Set(
    audit.jobNames.filter((job) => job !== name).map((job) => job.toLowerCase()),
  );
  const plain = (segment) => segment.toLowerCase().replace(/\.+$/, '');
  // This run's workspace or temp folder, or a scratch folder it made next to its temp folder, but
  // not another run's. A name at the end of a sentence, or cut off by a wrapped line, still counts.
  const allowed = (match, text) => {
    const [, first, second] = match;
    const end = match.index + match[0].length;
    const isOwn = (segment) =>
      segment !== undefined &&
      (plain(segment) === ownName || (wrapsAt(text, end) && ownName.startsWith(plain(segment))));
    if (isOwn(first)) return true;
    return (
      first === '_tmp' && second !== undefined && (isOwn(second) || !others.has(plain(second)))
    );
  };
  const seen = new Set();
  const add = (marker, file, text, index) => {
    // Nested markers, such as a folder and its parent, find the same place once.
    if (seen.has(`${file}\0${index}`)) return;
    seen.add(`${file}\0${index}`);
    const snippet = text.slice(Math.max(0, index - 80), index + 120).replace(/\s+/g, ' ');
    hits.push({ marker, file: basename(file), excerpt: redactPaths(snippet, {}) });
  };
  for (const file of files) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const { label, regex } of audit.markers) {
      const match = regex.exec(text);
      if (match) add(label, file, text, match.index);
    }
    // Other runs: an absolute path to anything else in the run directory (other workspaces, the
    // logs, the list of temp folders, records.json), or a relative path to another run's workspace,
    // the logs or the temp folders.
    if (audit.runDir) {
      const absolute = new RegExp(
        `${pathPattern(audit.runDir)}[\\\\/]+${pathSegment}(?:[\\\\/]+${pathSegment})?`,
        'gi',
      );
      const match = [...text.matchAll(absolute)].find((found) => !allowed(found, text));
      if (match) add('another run', file, text, match.index);
    }
    const upward = new RegExp(
      `\\.\\.[\\\\/]+(?:\\.\\.[\\\\/]+)*${pathSegment}(?:[\\\\/]+${pathSegment})?`,
      'g',
    );
    const match = [...text.matchAll(upward)].find(
      (found) =>
        !allowed(found, text) &&
        (found[1] === '_logs' || found[1] === '_tmp' || others.has(plain(found[1]))),
    );
    if (match) add('another run', file, text, match.index);
  }
  return { escaped: hits.length > 0, hits: hits.slice(0, 20) };
}
