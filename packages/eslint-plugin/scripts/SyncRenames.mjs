// Rewrites src/data/renames.json, the names envui/no-renamed-exports reports, from the codemods'
// rename map (packages/codemods/src/maps/v1.json), the canonical list of envUI 1.0 renames.
// It runs before every pack, so a published plugin carries the codemods' map whenever the
// repository has one; without it, the plugin's own copy in src/data/renames.json is kept.
//
//   node scripts/SyncRenames.mjs           update the copy from the codemods' map
//   node scripts/SyncRenames.mjs --check   fail when the copy differs from the codemods' map

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const codemodsMapUrl = new URL('../../codemods/src/maps/v1.json', import.meta.url);
export const renamesUrl = new URL('../src/data/renames.json', import.meta.url);
export const exportsUrl = new URL('../data/envui-0.7-exports.json', import.meta.url);

const comment =
  "Names that envUI 0.7 exported and 1.0 does not, by entry point, each with what replaces it in 1.0: one name, alternatives, or an empty list for a name that became internal. A name that becomes the Root part of its own namespace (Menu -> Menu.Root) stays importable, and only rendering it as a component is reported. scripts/SyncRenames.mjs rewrites this file from the codemods' rename map (packages/codemods/src/maps/v1.json) whenever that map exists, before every pack; source says where the entries came from.";

/** Fields of a map entry that may hold its replacement, in the order they are read. */
const targetFields = ['to', 'new', 'replacement', 'replacements', 'target', 'targets'];
/** Words a map may use, instead of a replacement, for a name that is no longer public. */
const removedWords = new Set(['internal', 'removed', 'private']);
const isName = (value) =>
  typeof value === 'string' && /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(value);
const ordinal = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** The replacements a map value gives: a list of names, [] for a removed name, else undefined. */
function targetsOf(value) {
  if (value === null || value === false) return [];
  if (typeof value === 'string')
    return removedWords.has(value) ? [] : isName(value) ? [value] : undefined;
  if (Array.isArray(value)) return value.every(isName) ? value : undefined;
  if (typeof value === 'object')
    for (const field of targetFields)
      if (Object.hasOwn(value, field)) return targetsOf(value[field]);
  return undefined;
}

/** The package entry a map key names, such as `./content`, if it names one. */
function entryOf(key) {
  if (key === '.' || key === '@envsemble/envui') return '@envsemble/envui';
  if (key.startsWith('./')) return `@envsemble/envui/${key.slice(2)}`;
  if (key.startsWith('@envsemble/envui/')) return key;
  return undefined;
}

/**
 * Reads the renames of envUI exports out of a rename map whose exact shape this plugin does not
 * own. It takes every pair of an old name that envUI 0.7 exported and a replacement, wherever the
 * map holds it: `"Input": "TextField"`, `"DirectionLink": ["Pager.Previous", "Pager.Next"]`,
 * `"LoadingBar": null`, `"Input": { "to": "TextField", … }`, or `{ "from": "Input", "to": … }`
 * in a list. Keys naming an entry point (`"./content"`) scope the pairs below them. Prop, value
 * and class renames are left out, because their old names were never exports.
 */
export function normalizeRenameMap(map, exportsSnapshot) {
  const owners = new Map();
  for (const [entry, { values, types }] of Object.entries(exportsSnapshot.modules))
    for (const name of [...values, ...types])
      owners.set(name, [...(owners.get(name) ?? []), entry]);
  const modules = Object.fromEntries(
    Object.keys(exportsSnapshot.modules).map((entry) => [entry, {}]),
  );

  function record(name, targets, entry) {
    const candidates = owners.get(name);
    if (!candidates || targets === undefined) return;
    if (targets.length === 1 && targets[0] === name) return;
    const owner = candidates.includes(entry) ? entry : candidates[0];
    modules[owner][name] ??= targets;
  }

  function visit(node, entry) {
    if (Array.isArray(node)) {
      for (const item of node) {
        const from = item && typeof item === 'object' ? (item.from ?? item.old) : undefined;
        if (typeof from === 'string')
          record(from, targetsOf(item), entryOf(item.module ?? item.entry ?? '') ?? entry);
        else visit(item, entry);
      }
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (owners.has(key) && targetsOf(value) !== undefined) record(key, targetsOf(value), entry);
      else visit(value, entryOf(key) ?? entry);
    }
  }

  visit(map, '@envsemble/envui');
  return Object.fromEntries(
    Object.entries(modules)
      .filter(([, names]) => Object.keys(names).length > 0)
      .map(([entry, names]) => [
        entry,
        Object.fromEntries(Object.entries(names).sort(([a], [b]) => ordinal(a, b))),
      ]),
  );
}

/**
 * The text of src/data/renames.json for the given entries, laid out as Prettier formats it: each
 * name's replacements on its line, unless they are longer than the repository's print width.
 */
export function serializeRenames(modules, source) {
  const json = (value) => JSON.stringify(value);
  const lines = [
    '{',
    `  "$comment": ${json(comment)},`,
    `  "source": ${json(source)},`,
    '  "modules": {',
  ];
  Object.entries(modules).forEach(([entry, names], entryIndex, entries) => {
    lines.push(`    ${json(entry)}: {`);
    Object.entries(names).forEach(([name, targets], nameIndex, pairs) => {
      const comma = nameIndex < pairs.length - 1 ? ',' : '';
      const line = `      ${json(name)}: [${targets.map(json).join(', ')}]${comma}`;
      if (line.length <= 100) lines.push(line);
      else
        lines.push(
          `      ${json(name)}: [`,
          ...targets.map(
            (target, index) => `        ${json(target)}${index < targets.length - 1 ? ',' : ''}`,
          ),
          `      ]${comma}`,
        );
    });
    lines.push(`    }${entryIndex < entries.length - 1 ? ',' : ''}`);
  });
  lines.push('  }', '}', '');
  return lines.join('\n');
}

/** The text src/data/renames.json should have, or undefined when there is no codemods map. */
export function expectedRenames() {
  if (!existsSync(codemodsMapUrl)) return undefined;
  const map = JSON.parse(readFileSync(codemodsMapUrl, 'utf8'));
  const snapshot = JSON.parse(readFileSync(exportsUrl, 'utf8'));
  return serializeRenames(normalizeRenameMap(map, snapshot), 'packages/codemods/src/maps/v1.json');
}

function main() {
  const check = process.argv.includes('--check');
  const current = readFileSync(renamesUrl, 'utf8');
  const expected = expectedRenames();
  const count = (text) =>
    Object.values(JSON.parse(text).modules).reduce(
      (sum, names) => sum + Object.keys(names).length,
      0,
    );
  if (expected === undefined) {
    console.log(
      `No rename map at ${fileURLToPath(codemodsMapUrl)}; keeping the plugin's own copy (${count(current)} names).`,
    );
    return;
  }
  if (expected === current) {
    console.log(
      `src/data/renames.json matches the codemods' rename map (${count(current)} names).`,
    );
    return;
  }
  if (check) {
    console.error(
      "src/data/renames.json differs from the codemods' rename map. Run npm run sync:renames --workspace @envsemble/eslint-plugin-envui.",
    );
    process.exitCode = 1;
    return;
  }
  writeFileSync(renamesUrl, expected);
  console.log(
    `Updated src/data/renames.json from the codemods' rename map (${count(expected)} names).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
