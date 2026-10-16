// Reads a rename map (src/maps/v1.json, or a file of the same shape passed as the `map` option) and
// turns it into lookups the transforms share. Keys that start with `$` are comments.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const defaultMapPath = fileURLToPath(new URL('./maps/v1.json', import.meta.url));

const identifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const part = /^([A-Za-z_$][A-Za-z0-9_$]*)\.([A-Za-z_$][A-Za-z0-9_$]*)$/;
const className = /^env-[a-z0-9][a-z0-9_-]*$/;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

/** The entries of an object without its `$` comment keys. */
export const entriesOf = (object) =>
  Object.entries(object ?? {}).filter(([key]) => !key.startsWith('$'));

/** A target name: `TextField` or the `Item` part of the `Menu` namespace for `Menu.Item`. */
export function parseTarget(name) {
  const match = part.exec(name);
  return match ? { to: name, namespace: match[1], part: match[2] } : { to: name };
}

/**
 * The new name of an `env-*` class or custom property name (without its `--`), or the name itself.
 * An entry renames its old name and every name that continues it with a hyphen; the longest entry
 * wins. A name that already continues the entry's new name is left alone, so `env-counter-badge`
 * does not become `env-counter-badge-badge` on a second run.
 */
export function renameClass(name, classes) {
  for (const { from, to } of classes) {
    if (name !== from && !name.startsWith(`${from}-`)) continue;
    if (to.startsWith(`${from}-`) && (name === to || name.startsWith(`${to}-`))) return name;
    return to + name.slice(from.length);
  }
  return name;
}

/** Every problem with a parsed rename map, as messages; an empty list for a well-formed map. */
export function validateMap(map) {
  const problems = [];
  if (!isObject(map)) return ['The map must be a JSON object.'];
  for (const section of ['exports', 'split', 'removed', 'classes', 'classesWithin', 'docs']) {
    if (map[section] !== undefined && !isObject(map[section]))
      problems.push(`"${section}" must be an object.`);
  }
  const seen = new Map();
  const claim = (entry, name, section) => {
    const key = `${entry} ${name}`;
    if (seen.has(key))
      problems.push(`${entry}: ${name} is listed in both "${seen.get(key)}" and "${section}".`);
    else seen.set(key, section);
  };
  const checkTarget = (where, from, to) => {
    if (typeof to !== 'string' || !(identifier.test(to) || part.test(to)))
      problems.push(`${where}: ${from} must map to a name or a Namespace.Part name.`);
    else if (to === from) problems.push(`${where}: ${from} maps to itself.`);
  };
  for (const [entry, names] of entriesOf(map.exports)) {
    if (!isObject(names)) {
      problems.push(`exports.${entry} must be an object.`);
      continue;
    }
    for (const [from, to] of entriesOf(names)) {
      if (!identifier.test(from)) problems.push(`exports.${entry}: ${from} is not a name.`);
      checkTarget(`exports.${entry}`, from, to);
      claim(entry, from, 'exports');
    }
    // A new name that is also an old one would be renamed again on a second run.
    for (const [from, to] of entriesOf(names)) {
      if (typeof to === 'string' && to !== from && Object.hasOwn(names, to))
        problems.push(`exports.${entry}: ${from} becomes ${to}, which is itself renamed.`);
    }
  }
  for (const [entry, names] of entriesOf(map.split)) {
    if (!isObject(names)) {
      problems.push(`split.${entry} must be an object.`);
      continue;
    }
    for (const [from, rule] of entriesOf(names)) {
      const where = `split.${entry}.${from}`;
      if (!identifier.test(from)) problems.push(`${where}: ${from} is not a name.`);
      if (!isObject(rule) || typeof rule.prop !== 'string' || !identifier.test(rule.prop))
        problems.push(`${where} needs a "prop" name.`);
      if (!isObject(rule?.values) || entriesOf(rule.values).length === 0)
        problems.push(`${where} needs "values" mapping prop values to names.`);
      else
        for (const [value, to] of entriesOf(rule.values)) {
          if (typeof to !== 'string' || !part.test(to))
            problems.push(`${where}: ${value} must map to a Namespace.Part name.`);
        }
      claim(entry, from, 'split');
    }
  }
  for (const [entry, names] of entriesOf(map.removed)) {
    if (!isObject(names)) {
      problems.push(`removed.${entry} must be an object.`);
      continue;
    }
    for (const [name, rule] of entriesOf(names)) {
      const where = `removed.${entry}.${name}`;
      if (!identifier.test(name)) problems.push(`${where}: ${name} is not a name.`);
      if (!isObject(rule) || typeof rule.use !== 'string' || rule.use.trim() === '')
        problems.push(`${where} needs a "use" hint.`);
      if (rule?.value !== undefined && !['string', 'number', 'boolean'].includes(typeof rule.value))
        problems.push(`${where}: "value" must be a string, number or boolean literal.`);
      claim(entry, name, 'removed');
    }
  }
  const classes = [];
  for (const [from, to] of entriesOf(map.classes)) {
    if (!className.test(from) || from.endsWith('-'))
      problems.push(`classes: ${from} is not an env- class name.`);
    if (typeof to !== 'string' || !className.test(to) || to.endsWith('-'))
      problems.push(`classes: ${from} must map to an env- class name.`);
    else if (to === from) problems.push(`classes: ${from} maps to itself.`);
    classes.push({ from, to });
  }
  const sorted = sortClasses(classes);
  for (const { from, to } of sorted) {
    if (typeof to === 'string' && renameClass(to, sorted) !== to)
      problems.push(
        `classes: ${from} becomes ${to}, which another entry renames again to ${renameClass(to, sorted)}.`,
      );
  }
  for (const [ancestor, names] of entriesOf(map.classesWithin)) {
    if (!className.test(ancestor) || ancestor.endsWith('-'))
      problems.push(`classesWithin: ${ancestor} is not an env- class name.`);
    if (!isObject(names)) {
      problems.push(`classesWithin.${ancestor} must be an object.`);
      continue;
    }
    for (const [from, to] of entriesOf(names)) {
      if (!className.test(from) || typeof to !== 'string' || !className.test(to))
        problems.push(`classesWithin.${ancestor}: ${from} must map to an env- class name.`);
      else if (to === from) problems.push(`classesWithin.${ancestor}: ${from} maps to itself.`);
      else if (renameClass(to, sorted) !== to)
        problems.push(
          `classesWithin.${ancestor}: ${from} becomes ${to}, which classes renames again to ${renameClass(to, sorted)}.`,
        );
    }
  }
  for (const [from, to] of entriesOf(map.docs)) {
    if (!slug.test(from) || typeof to !== 'string' || !slug.test(to))
      problems.push(`docs: ${from} must map one page slug to another.`);
    else if (to === from) problems.push(`docs: ${from} maps to itself.`);
  }
  return problems;
}

const sortClasses = (classes) =>
  [...classes].sort((a, b) => b.from.length - a.from.length || a.from.localeCompare(b.from));

/**
 * The lookups for a parsed map:
 * - `entries`: per entry point, `renames` (old name to target), `splits` (old name to its prop and
 *   the target for each value), `removed` (old name to its hint and literal) and `namespaces` (the
 *   namespace exports that the entry has in 1.0);
 * - `classes`: class renames, longest old name first;
 * - `classesWithin`: class renames that apply inside an ancestor's selector, as
 *   `{ ancestor, from, to }`.
 */
export function normalizeMap(map) {
  const entries = new Map();
  const entryFor = (name) => {
    if (!entries.has(name))
      entries.set(name, {
        name,
        renames: new Map(),
        splits: new Map(),
        removed: new Map(),
        namespaces: new Set(),
      });
    return entries.get(name);
  };
  for (const [name, names] of entriesOf(map.exports)) {
    const entry = entryFor(name);
    for (const [from, to] of entriesOf(names)) {
      const target = parseTarget(to);
      entry.renames.set(from, target);
      if (target.namespace) entry.namespaces.add(target.namespace);
    }
  }
  for (const [name, names] of entriesOf(map.split)) {
    const entry = entryFor(name);
    for (const [from, rule] of entriesOf(names)) {
      const values = new Map();
      for (const [value, to] of entriesOf(rule.values)) {
        const target = parseTarget(to);
        values.set(value, target);
        if (target.namespace) entry.namespaces.add(target.namespace);
      }
      entry.splits.set(from, { prop: rule.prop, values });
    }
  }
  for (const [name, names] of entriesOf(map.removed)) {
    const entry = entryFor(name);
    for (const [from, rule] of entriesOf(names)) entry.removed.set(from, rule);
  }
  const classes = sortClasses(entriesOf(map.classes).map(([from, to]) => ({ from, to })));
  const classesWithin = entriesOf(map.classesWithin).flatMap(([ancestor, names]) =>
    entriesOf(names).map(([from, to]) => ({ ancestor, from, to })),
  );
  return { entries, classes, classesWithin };
}

const cache = new Map();

/** The normalized map at `path` (the bundled v1 map by default), read and checked once per path. */
export function loadMap(path = defaultMapPath) {
  const file = resolve(path);
  if (!cache.has(file)) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      throw new Error(`Cannot read the rename map ${file}: ${error.message}`, { cause: error });
    }
    const problems = validateMap(parsed);
    if (problems.length > 0)
      throw new Error(`The rename map ${file} is malformed:\n- ${problems.join('\n- ')}`);
    cache.set(file, normalizeMap(parsed));
  }
  return cache.get(file);
}
