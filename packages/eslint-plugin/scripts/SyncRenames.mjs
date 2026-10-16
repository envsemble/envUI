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
  "Names that envUI 0.7 exported and 1.0 does not, by entry point. Each entry's `to` lists what replaces it in 1.0: one name, alternatives, or nothing for a name that became internal, whose `use` says what to do instead. A split (DirectionLink) also has the `prop` whose `values` choose the part. A name that becomes the Root part of its own namespace (Menu -> Menu.Root) stays importable, and so does a removed name that 1.0 reuses as a namespace (`namespace`: the manual Toast; 1.0's Toast holds Toast.Provider); only rendering them as components is reported. scripts/SyncRenames.mjs rewrites this file from the codemods' rename map (packages/codemods/src/maps/v1.json) whenever that map exists, before every pack; source says where the entries came from.";

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
  if (typeof value === 'object') {
    for (const field of targetFields)
      if (Object.hasOwn(value, field)) return targetsOf(value[field]);
    // A split: one old name becomes one of several, chosen by a prop's value.
    if (value.values && typeof value.values === 'object')
      return targetsOf(Object.values(value.values));
    // A removal: the entry says what to use instead, but names no replacement export.
    if (typeof value.use === 'string') return [];
  }
  return undefined;
}

/**
 * What a map value says about an old name: `to`, its replacements, with the `use` hint of a
 * removed name and the `prop` and `values` of a split; undefined when it is not a rename.
 */
function renameOf(value) {
  const to = targetsOf(value);
  if (to === undefined) return undefined;
  const rename = { to };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return rename;
  if (typeof value.use === 'string' && value.use.trim() !== '') rename.use = value.use;
  if (
    typeof value.prop === 'string' &&
    value.values &&
    typeof value.values === 'object' &&
    Object.values(value.values).every(isName)
  ) {
    rename.prop = value.prop;
    rename.values = value.values;
  }
  return rename;
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

  function record(name, rename, entry) {
    const candidates = owners.get(name);
    if (!candidates || rename === undefined) return;
    if (rename.to.length === 1 && rename.to[0] === name) return;
    const owner = candidates.includes(entry) ? entry : candidates[0];
    modules[owner][name] ??= rename;
  }

  function visit(node, entry) {
    if (Array.isArray(node)) {
      for (const item of node) {
        const from = item && typeof item === 'object' ? (item.from ?? item.old) : undefined;
        if (typeof from === 'string')
          record(from, renameOf(item), entryOf(item.module ?? item.entry ?? '') ?? entry);
        else visit(item, entry);
      }
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (owners.has(key) && renameOf(value) !== undefined) record(key, renameOf(value), entry);
      else visit(value, entryOf(key) ?? entry);
    }
  }

  visit(map, '@envsemble/envui');
  // A name removed from 0.7 that 1.0 reuses as a namespace (the manual Toast; 1.0's Toast holds
  // Toast.Provider) stays importable, so only rendering the old component is reported.
  for (const names of Object.values(modules))
    for (const [name, rename] of Object.entries(names)) {
      if (rename.to.length > 0) continue;
      const reused = Object.values(names).some(({ to }) =>
        to.some((target) => target.startsWith(`${name}.`)),
      );
      if (reused) rename.namespace = true;
    }
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
 * The text of src/data/renames.json for the given entries, as Prettier formats it: each name's entry
 * on its line, unless it is longer than the repository's print width.
 */
export async function serializeRenames(modules, source) {
  const json = (value) => JSON.stringify(value);
  // Each entry on one line, which Prettier keeps when it fits and breaks when it does not.
  const entries = Object.entries(modules).map(([entry, names]) => {
    const lines = Object.entries(names).map(([name, rename]) => `${json(name)}: ${json(rename)}`);
    return `${json(entry)}: {\n${lines.join(',\n')}\n}`;
  });
  const text = [
    '{',
    `"$comment": ${json(comment)},`,
    `"source": ${json(source)},`,
    `"modules": {\n${entries.join(',\n')}\n}`,
    '}',
  ].join('\n');
  const { format, resolveConfig } = await import('prettier');
  const path = fileURLToPath(renamesUrl);
  return format(text, { ...(await resolveConfig(path)), filepath: path });
}

/** The text src/data/renames.json should have, or undefined when there is no codemods map. */
export async function expectedRenames() {
  if (!existsSync(codemodsMapUrl)) return undefined;
  const map = JSON.parse(readFileSync(codemodsMapUrl, 'utf8'));
  const snapshot = JSON.parse(readFileSync(exportsUrl, 'utf8'));
  return serializeRenames(normalizeRenameMap(map, snapshot), 'packages/codemods/src/maps/v1.json');
}

async function main() {
  const check = process.argv.includes('--check');
  const current = readFileSync(renamesUrl, 'utf8');
  const expected = await expectedRenames();
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
