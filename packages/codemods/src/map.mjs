// Reads a rename map and turns it into lookups the transforms share. Keys that start with `$` are
// comments.
//
// The bundled map is a folder, src/maps/v1: map.json holds its header (the version, the package
// and a comment per section), and every other file is a fragment of one section, named after the
// component family it covers, as `props/Button.json` or `classes/Menu.json`. A fragment holds
// what the section holds for that family, in the section's shape; `readMap` merges them into one
// map, and fails where two fragments set the same name. The `map` option takes such a folder or a
// single JSON file with the merged shape.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const defaultMapPath = fileURLToPath(new URL('./maps/v1', import.meta.url));

/** The sections of a rename map, in the order the merged map lists them. */
export const mapSections = [
  'exports',
  'split',
  'removed',
  'props',
  'calls',
  'render',
  'structure',
  'classes',
  'classAttributes',
  'classesWithin',
  'classReports',
  'docs',
  'tokens',
];

/**
 * How deep a section's names sit: `exports` lists names per entry point, `props` components per
 * entry point, `classes` names at the top. Fragments merge down to this depth, and two fragments
 * may not both set a name there.
 */
const sectionDepth = {
  exports: 2,
  split: 2,
  removed: 2,
  props: 2,
  calls: 2,
  render: 2,
  structure: 2,
  classes: 1,
  classAttributes: 1,
  classesWithin: 1,
  classReports: 1,
  docs: 1,
  tokens: 1,
};

/** The fragment files of a map folder, relative to it with forward slashes, in a stable order. */
export function mapFragments(directory = defaultMapPath) {
  const found = [];
  for (const section of readdirSync(directory, { withFileTypes: true })) {
    if (!section.isDirectory()) continue;
    for (const file of readdirSync(join(directory, section.name)))
      if (file.endsWith('.json')) found.push(`${section.name}/${file}`);
  }
  return found.sort();
}

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read the rename map ${file}: ${error.message}`, { cause: error });
  }
};

/**
 * The rename map at `path` as one object, in the shape of a single-file map: a JSON file as it is,
 * or a folder's header with its fragments merged into their sections.
 */
export function readMap(path = defaultMapPath) {
  const location = resolve(path);
  let directory = false;
  try {
    directory = statSync(location).isDirectory();
  } catch {
    // A missing path fails below, as a file that cannot be read.
  }
  if (!directory) return readJson(location);
  const { sections: comments = {}, ...header } = readJson(join(location, 'map.json'));
  const map = { ...header };
  for (const section of mapSections)
    if (comments[section] !== undefined) map[section] = { $comment: comments[section] };
  const owners = new Map();
  for (const fragment of mapFragments(location)) {
    const [section] = fragment.split('/');
    if (!Object.hasOwn(sectionDepth, section))
      throw new Error(
        `The rename map ${location} has a folder ${section}, which is no section: ${mapSections.join(', ')}.`,
      );
    map[section] ??= {};
    const merge = (target, source, depth, trail) => {
      for (const [key, value] of Object.entries(source)) {
        if (key.startsWith('$')) continue;
        const where = [...trail, key];
        if (depth > 1 && typeof value === 'object' && value !== null && !Array.isArray(value)) {
          target[key] ??= {};
          merge(target[key], value, depth - 1, where);
          continue;
        }
        const name = `${section} ${where.join(' ')}`;
        if (owners.has(name))
          throw new Error(
            `The rename map ${location} sets ${section} > ${where.join(' > ')} in both ${owners.get(name)} and ${fragment}.`,
          );
        owners.set(name, fragment);
        target[key] = value;
      }
    };
    merge(map[section], readJson(join(location, fragment)), sectionDepth[section], []);
  }
  return map;
}

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
  for (const section of mapSections) {
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
  for (const [name, rule] of entriesOf(map.classReports)) {
    const where = `classReports.${name}`;
    if (!className.test(name) || name.endsWith('-'))
      problems.push(`classReports: ${name} is not an env- class name.`);
    if (!isObject(rule) || typeof rule.report !== 'string' || rule.report.trim() === '') {
      problems.push(`${where} needs a "report" that says what to use instead.`);
      continue;
    }
    if (rule.attributes !== undefined) {
      if (
        rule.within !== undefined ||
        !Array.isArray(rule.attributes) ||
        rule.attributes.length === 0 ||
        !rule.attributes.every((attribute) => /^[a-z][a-z0-9-]*$/.test(attribute))
      )
        problems.push(`${where}: "attributes" must be attribute names, without "within".`);
      else if (renameClass(name, sorted) !== name)
        problems.push(
          `${where}: name its class by its 1.0 name, which it reports after the renames.`,
        );
    } else if (rule.within !== undefined) {
      if (typeof rule.within !== 'string' || !className.test(rule.within))
        problems.push(`${where}: "within" must be an env- class name.`);
      else if (
        renameClass(rule.within, sorted) !== rule.within ||
        renameClass(name, sorted) !== name
      )
        problems.push(
          `${where}: name its classes by their 1.0 names, which it reports after the renames.`,
        );
    } else if (Object.hasOwn(map.classes ?? {}, name))
      problems.push(`${where}: ${name} is also renamed in classes.`);
  }
  for (const [from, to] of entriesOf(map.docs)) {
    if (!slug.test(from) || typeof to !== 'string' || !slug.test(to))
      problems.push(`docs: ${from} must map one page slug to another.`);
    else if (to === from) problems.push(`docs: ${from} maps to itself.`);
  }
  problems.push(...validateProps(map.props));
  problems.push(...validateCalls(map.calls));
  problems.push(...validateRender(map.render));
  problems.push(...validateStructure(map.structure));
  problems.push(...validateClassAttributes(map.classAttributes, map.classes));
  problems.push(...validateTokens(map.tokens));
  return problems;
}

const oldProperty = /^--[a-z0-9]+(?:-[a-z0-9]+)*$/;
const newProperty = /^--env-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Problems with the `tokens` section: each old custom property, without the --env- prefix or a
 * name that 1.0's development gave it, maps to the --env- property that replaces it (`to`), to a
 * fixed color's `value`, or is `removed`, with `to` what to use instead or null.
 */
function validateTokens(tokens) {
  const problems = [];
  for (const [from, entry] of entriesOf(tokens)) {
    const where = `tokens.${from}`;
    if (!oldProperty.test(from))
      problems.push(`${where}: ${from} is not a custom property before 1.0.`);
    if (!isObject(entry)) {
      problems.push(`${where} must be an object.`);
      continue;
    }
    if (entry.removed === true) {
      if (entry.to !== null && !newProperty.test(entry.to ?? ''))
        problems.push(`${where}: "to" must be an --env- custom property or null.`);
    } else if (entry.value !== undefined) {
      if (typeof entry.value !== 'string' && !isObject(entry.value))
        problems.push(`${where}: "value" must be a color or a color per theme.`);
    } else if (typeof entry.to !== 'string' || !newProperty.test(entry.to))
      problems.push(`${where} needs "to", an --env- custom property, "value" or "removed".`);
    else if (entry.to === from) problems.push(`${where} maps to itself.`);
  }
  return problems;
}

const propName = /^[A-Za-z_$][A-Za-z0-9_$-]*$/;
const propValue = (value) => ['string', 'number', 'boolean'].includes(typeof value);

/** An element a structure case adds as a prop, such as `{ "element": "article" }` for render={<article />}. */
const elementValue = (value) =>
  isObject(value) &&
  Object.keys(value).length === 1 &&
  typeof value.element === 'string' &&
  /^[a-z][a-z0-9]*$/.test(value.element);

/**
 * Problems with the rules for one component's props, or one call's object properties: each has a
 * `report` that says what replaces it, and `values` mapping its literal values to the props that
 * replace them, or `to`, the name it takes in 1.0, with `values` for the literals that change. A
 * rule with neither is report-only: the prop keeps its name and value, and every use is reported.
 * `each` holds the rules for the properties of each object in an array the prop takes, such as an
 * organization's `name`; a rule with `each` alone reports only a value it can't read.
 */
function validatePropRules(where, names) {
  const problems = [];
  if (!isObject(names)) return [`${where} must be an object.`];
  for (const [name, rule] of entriesOf(names)) {
    const at = `${where}.${name}`;
    if (!propName.test(name)) problems.push(`${at}: ${name} is not a prop name.`);
    if (!isObject(rule) || typeof rule.report !== 'string' || rule.report.trim() === '') {
      problems.push(`${at} needs a "report" that says what replaces the prop.`);
      continue;
    }
    if (rule.each !== undefined) problems.push(...validatePropRules(`${at}.each`, rule.each));
    if (rule.to !== undefined && (typeof rule.to !== 'string' || !propName.test(rule.to)))
      problems.push(`${at}: "to" must be a prop name.`);
    else if (rule.to === name) problems.push(`${at}: "to" renames the prop to itself.`);
    // A rule with neither "to" nor "values" only reports: the prop stays, and its meaning changed.
    if (rule.to === undefined && rule.values === undefined) {
      if (rule.current !== undefined)
        problems.push(`${at}: "current" needs "values"; a report-only rule has neither.`);
      continue;
    }
    if (rule.to === undefined && (!isObject(rule.values) || entriesOf(rule.values).length === 0)) {
      problems.push(`${at} needs "values" mapping its literal values to new props, or "to".`);
      continue;
    }
    if (rule.values !== undefined && !isObject(rule.values)) {
      problems.push(`${at}: "values" must be an object.`);
      continue;
    }
    if (
      rule.current !== undefined &&
      (!Array.isArray(rule.current) || !rule.current.every((value) => propValue(value)))
    )
      problems.push(`${at}: "current" must list the prop's 1.0 literal values.`);
    for (const value of rule.current ?? [])
      if (Object.hasOwn(rule.values ?? {}, String(value)))
        problems.push(`${at}: ${value} is both a 0.x value and a 1.0 one.`);
    for (const [value, replacement] of entriesOf(rule.values)) {
      if (!isObject(replacement)) {
        problems.push(`${at}.values.${value} must be an object.`);
        continue;
      }
      for (const [newName, newValue] of Object.entries(replacement.props ?? {}))
        if (!propName.test(newName) || !propValue(newValue))
          problems.push(`${at}.values.${value}: ${newName} must be a prop with a literal.`);
      if (replacement.report !== undefined && typeof replacement.report !== 'string')
        problems.push(`${at}.values.${value}: "report" must be a string.`);
      if (
        replacement.unless !== undefined &&
        (replacement.report === undefined ||
          !Array.isArray(replacement.unless) ||
          !replacement.unless.every((each) => typeof each === 'string' && propName.test(each)))
      )
        problems.push(`${at}.values.${value}: "unless" must list prop names beside a "report".`);
    }
  }
  return problems;
}

/** Problems with the `props` section: per entry point, component and prop, its literal values. */
function validateProps(props) {
  const problems = [];
  for (const [entry, components] of entriesOf(props)) {
    if (!isObject(components)) {
      problems.push(`props.${entry} must be an object.`);
      continue;
    }
    for (const [component, names] of entriesOf(components)) {
      if (!(identifier.test(component) || part.test(component)))
        problems.push(`props.${entry}: ${component} is not a component or Namespace.Part name.`);
      problems.push(...validatePropRules(`props.${entry}.${component}`, names));
    }
  }
  return problems;
}

/**
 * A call whose first argument's object properties change: `show` for a function imported by name,
 * or `useToast().show` for the method of what a hook returns.
 */
const callName = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\(\)\.[A-Za-z_$][A-Za-z0-9_$]*)?$/;

/** Problems with the `calls` section: per entry point and call, the object's properties. */
function validateCalls(calls) {
  const problems = [];
  for (const [entry, names] of entriesOf(calls)) {
    if (!isObject(names)) {
      problems.push(`calls.${entry} must be an object.`);
      continue;
    }
    for (const [call, properties] of entriesOf(names)) {
      if (!callName.test(call))
        problems.push(`calls.${entry}: ${call} is not a function or a hook().method name.`);
      problems.push(...validatePropRules(`calls.${entry}.${call}`, properties));
    }
  }
  return problems;
}

/** Problems with the `render` section: per entry point, the components whose `prop` becomes render. */
function validateRender(render) {
  const problems = [];
  for (const [entry, components] of entriesOf(render)) {
    if (!isObject(components)) {
      problems.push(`render.${entry} must be an object.`);
      continue;
    }
    for (const [component, rule] of entriesOf(components)) {
      const where = `render.${entry}.${component}`;
      if (!(identifier.test(component) || part.test(component)))
        problems.push(`${where}: ${component} is not a component or Namespace.Part name.`);
      if (!isObject(rule) || typeof rule.prop !== 'string' || !propName.test(rule.prop))
        problems.push(`${where} needs the "prop" that becomes render.`);
      for (const [value, report] of entriesOf(rule?.except))
        if (typeof report !== 'string')
          problems.push(`${where}.except.${value} must be the report for that value.`);
    }
  }
  return problems;
}

/** Problems with one prop operation of a structure case. */
function validatePropOperation(where, operation) {
  if (operation === null || operation === 'render') return [];
  if (!isObject(operation)) return [`${where} must be null (drop), "render" or an object.`];
  const problems = [];
  if (
    operation.to !== undefined &&
    (typeof operation.to !== 'string' || !propName.test(operation.to))
  )
    problems.push(`${where}: "to" must be a prop name.`);
  for (const [value, next] of entriesOf(operation.values))
    if (next !== null && !propValue(next))
      problems.push(`${where}.values.${value} must be a literal or null (drop).`);
  return problems;
}

const isComponentName = (name) =>
  typeof name === 'string' && (identifier.test(name) || part.test(name));

/** Problems with one case of a structure rule. */
function validateStructureCase(at, each) {
  if (!isObject(each)) return [`${at} must be an object.`];
  const problems = [];
  for (const [prop, values] of entriesOf(each.when))
    if (!Array.isArray(values) || !values.every((value) => value === null || propValue(value)))
      problems.push(
        `${at}.when.${prop} must list literals, or null for a missing prop; "has" matches any value.`,
      );
  if (each.element !== undefined && !isComponentName(each.element))
    problems.push(`${at}: "element" must be a component name.`);
  for (const [prop, operation] of entriesOf(each.props))
    problems.push(...validatePropOperation(`${at}.props.${prop}`, operation));
  for (const [prop, value] of Object.entries(each.add ?? {}))
    if (!propName.test(prop) || !(propValue(value) || elementValue(value)))
      problems.push(`${at}.add: ${prop} must be a prop with a literal or an { "element" }.`);
  if (
    each.has !== undefined &&
    (!Array.isArray(each.has) ||
      !each.has.every((prop) => typeof prop === 'string' && propName.test(prop)))
  )
    problems.push(`${at}.has must list prop names.`);
  if (each.content !== undefined) {
    if (!Array.isArray(each.content) || each.content.length === 0)
      problems.push(`${at}.content must list the elements it makes.`);
    for (const [index, item] of (Array.isArray(each.content) ? each.content : []).entries()) {
      const where = `${at}.content[${index}]`;
      if (!isObject(item) || !isComponentName(item.element)) {
        problems.push(`${where} needs an "element".`);
        continue;
      }
      if (
        item.children !== undefined &&
        (typeof item.children !== 'string' || !propName.test(item.children))
      )
        problems.push(`${where}: "children" must name the prop whose value it takes.`);
      for (const [to, from] of Object.entries(item.props ?? {}))
        if (!propName.test(to) || typeof from !== 'string' || !propName.test(from))
          problems.push(`${where}.props: ${to} must name the element's prop it takes.`);
    }
  }
  if (each.wrap !== undefined) {
    if (!isObject(each.wrap) || !isComponentName(each.wrap.element))
      problems.push(`${at}.wrap needs an "element".`);
    for (const [prop, value] of Object.entries(each.wrap?.props ?? {}))
      if (!propName.test(prop) || !propValue(value))
        problems.push(`${at}.wrap.props: ${prop} must be a prop with a literal.`);
  }
  if (each.wrapChildren !== undefined) {
    if (!isObject(each.wrapChildren) || !isComponentName(each.wrapChildren.element))
      problems.push(`${at}.wrapChildren needs an "element".`);
    for (const [prop, to] of Object.entries(each.wrapChildren?.props ?? {}))
      if (!propName.test(prop) || (to !== null && (typeof to !== 'string' || !propName.test(to))))
        problems.push(`${at}.wrapChildren.props: ${prop} must map to a prop name or null.`);
  }
  if (
    each.lift !== undefined &&
    (!Array.isArray(each.lift) || !each.lift.every((prop) => propName.test(prop)))
  )
    problems.push(`${at}.lift must list prop names.`);
  for (const [child, childRule] of entriesOf(each.children)) {
    if (!isObject(childRule)) {
      problems.push(`${at}.children.${child} must be an object.`);
      continue;
    }
    for (const [prop, value] of Object.entries(childRule.add ?? {}))
      if (!propName.test(prop) || !propValue(value))
        problems.push(`${at}.children.${child}.add: ${prop} must be a prop with a literal.`);
    if (childRule.report !== undefined && typeof childRule.report !== 'string')
      problems.push(`${at}.children.${child}: "report" must be a string.`);
  }
  if (each.report !== undefined && typeof each.report !== 'string')
    problems.push(`${at}: "report" must be a string.`);
  return problems;
}

/** Transforms of their own that rewrite a structure entry, instead of its cases. */
export const structureTransforms = ['v1-app-shell'];

/** Problems with the `structure` section: per entry point and component, its cases. */
function validateStructure(structure) {
  const problems = [];
  for (const [entry, components] of entriesOf(structure)) {
    if (!isObject(components)) {
      problems.push(`structure.${entry} must be an object.`);
      continue;
    }
    for (const [component, rule] of entriesOf(components)) {
      const where = `structure.${entry}.${component}`;
      if (!isComponentName(component))
        problems.push(`${where}: ${component} is not a component or Namespace.Part name.`);
      if (!isObject(rule) || typeof rule.report !== 'string' || rule.report.trim() === '') {
        problems.push(`${where} needs a "report" for the uses it can't rewrite.`);
        continue;
      }
      // An element a transform of its own rewrites, such as AppShell's one-to-many parts, has its
      // reports here and no cases.
      if (rule.transform !== undefined) {
        if (!structureTransforms.includes(rule.transform))
          problems.push(`${where}: "transform" must be one of ${structureTransforms.join(', ')}.`);
        if (rule.cases !== undefined) problems.push(`${where}: a "transform" entry has no cases.`);
        for (const [name, report] of entriesOf(rule.reports))
          if (typeof report !== 'string' || report.trim() === '')
            problems.push(`${where}.reports.${name} must be a report.`);
        continue;
      }
      if (!Array.isArray(rule.cases) || rule.cases.length === 0) {
        problems.push(`${where} needs "cases".`);
        continue;
      }
      rule.cases.forEach((each, index) =>
        problems.push(...validateStructureCase(`${where}.cases[${index}]`, each)),
      );
    }
  }
  return problems;
}

const attributeName = /^data-[a-z][a-z0-9-]*$/;

/**
 * Problems with the `classAttributes` section: each 0.x modifier class becomes attributes on the
 * root class it modified, as `env-button-important` becomes `.env-button` with data-variant and
 * data-tone.
 */
function validateClassAttributes(classAttributes, classes) {
  const problems = [];
  for (const [from, rule] of entriesOf(classAttributes)) {
    const where = `classAttributes.${from}`;
    if (!className.test(from) || from.endsWith('-'))
      problems.push(`${where}: ${from} is not an env- class name.`);
    if (Object.hasOwn(classes ?? {}, from))
      problems.push(`${where}: ${from} is also renamed in classes.`);
    if (!isObject(rule) || typeof rule.class !== 'string' || !className.test(rule.class)) {
      problems.push(`${where} needs the root "class" the attributes go on.`);
      continue;
    }
    if (!isObject(rule.attributes) || Object.keys(rule.attributes).length === 0)
      problems.push(`${where} needs "attributes".`);
    for (const [name, value] of Object.entries(rule.attributes ?? {}))
      if (!attributeName.test(name) || typeof value !== 'string' || /['"\]\\]/.test(value))
        problems.push(`${where}: ${name} must be a data- attribute with a plain string value.`);
  }
  return problems;
}

const sortClasses = (classes) =>
  [...classes].sort((a, b) => b.from.length - a.from.length || a.from.localeCompare(b.from));

/**
 * The lookups for a parsed map:
 * - `entries`: per entry point, `renames` (old name to target), `splits` (old name to its prop and
 *   the target for each value), `removed` (old name to its hint and literal), `props` (each
 *   component's changed props, by its 1.0 name, with the replacement of each literal value) and
 *   `namespaces` (the namespace exports that the entry has in 1.0);
 * - `classes`: class renames, longest old name first;
 * - `classesWithin`: class renames that apply inside an ancestor's selector, as
 *   `{ ancestor, from, to }`;
 * - `classReports`: classes and selectors that v1-classes leaves and reports, as
 *   `{ name, within, attributes, report }`; a class reported without `within` or `attributes` is
 *   also kept by the class renames, so a shorter entry that it continues does not rename it;
 * - `tokens`: each custom property before 1.0, without its `--`, to its entry: `to` the 1.0
 *   name (without `--`) that replaces it, with `declaration`, the report for a declaration of a
 *   name that shares its target and is not the target's own, or a `report` for a fixed color or a
 *   removed name;
 * - `tokenNames`: the 1.0 names the tokens become, without `--`, which class renames leave alone.
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
        props: new Map(),
        calls: new Map(),
        render: new Map(),
        structure: new Map(),
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
  const propRules = (names) =>
    new Map(
      entriesOf(names).map(([prop, rule]) => [
        prop,
        {
          report: rule.report,
          to: rule.to,
          values: Object.fromEntries(entriesOf(rule.values)),
          current: new Set((rule.current ?? []).map(String)),
          ...(rule.each !== undefined && { each: propRules(rule.each) }),
        },
      ]),
    );
  for (const [name, components] of entriesOf(map.props)) {
    const entry = entryFor(name);
    for (const [component, names] of entriesOf(components))
      entry.props.set(component, propRules(names));
  }
  for (const [name, calls] of entriesOf(map.calls)) {
    const entry = entryFor(name);
    for (const [call, names] of entriesOf(calls)) {
      const [callee, method] = call.split('().');
      entry.calls.set(call, { callee, method, rules: propRules(names) });
    }
  }
  for (const [name, components] of entriesOf(map.render)) {
    const entry = entryFor(name);
    for (const [component, rule] of entriesOf(components))
      entry.render.set(component, {
        prop: rule.prop,
        except: Object.fromEntries(entriesOf(rule.except)),
      });
  }
  for (const [name, components] of entriesOf(map.structure)) {
    const entry = entryFor(name);
    for (const [component, rule] of entriesOf(components)) entry.structure.set(component, rule);
  }
  const classReports = entriesOf(map.classReports).map(([name, rule]) => ({
    name,
    within: rule.within,
    attributes: rule.attributes,
    report: rule.report,
  }));
  const classes = sortClasses([
    ...entriesOf(map.classes).map(([from, to]) => ({ from, to })),
    ...classReports
      .filter((rule) => !rule.within && !rule.attributes)
      .map(({ name }) => ({ from: name, to: name })),
  ]);
  const classAttributes = new Map(
    entriesOf(map.classAttributes).map(([from, rule]) => [
      from,
      { class: rule.class, attributes: rule.attributes },
    ]),
  );
  const classesWithin = entriesOf(map.classesWithin).flatMap(([ancestor, names]) =>
    entriesOf(names).map(([from, to]) => ({ ancestor, from, to })),
  );
  const tokens = new Map();
  const tokenNames = new Set();
  for (const [from, entry] of entriesOf(map.tokens)) {
    const name = from.slice(2);
    if (entry.removed)
      tokens.set(name, {
        report: `${from} is removed in 1.0${entry.to ? `; use ${entry.to}` : ''}${entry.note ? `: ${entry.note}` : '.'}`,
      });
    else if (entry.value !== undefined)
      tokens.set(name, {
        report: `${from} is removed in 1.0 and no token replaces it: write its color, ${
          typeof entry.value === 'string'
            ? entry.value
            : Object.entries(entry.value)
                .map(([theme, value]) => `${value} in ${theme}`)
                .join(', ')
        }, or a custom property of your own.`,
      });
    else {
      tokens.set(name, { to: entry.to.slice(2), note: entry.note });
      tokenNames.add(entry.to.slice(2));
    }
  }
  // A declaration of an old name is rewritten only where the name is the one that becomes its
  // target: the only one, or the target's own name before the prefix. Where several names become
  // one token, as --control-height, --control-height-small and --icon-button-size all become
  // --env-control-height, a declaration of another of them would set the token every component
  // reads, so it is reported instead, with `declaration` the message.
  const sources = new Map();
  for (const [name, entry] of tokens)
    if (entry.to) sources.set(entry.to, [...(sources.get(entry.to) ?? []), name]);
  for (const [name, entry] of tokens) {
    if (!entry.to) continue;
    const others = sources.get(entry.to).filter((other) => other !== name);
    if (others.length === 0 || entry.to === `env-${name}`) continue;
    const list = [name, ...others].map((other) => `--${other}`);
    const names = `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`;
    entry.declaration =
      `--${name} is declared here, but 1.0 merges ${names} into one token, --${entry.to}. ` +
      `The codemod leaves the declaration, since rewriting it would set --${entry.to} for every ` +
      `component that reads it, and renames only its uses: remove it, or set --${entry.to} where ` +
      `you mean that.${entry.note ? ` ${entry.note}` : ''}`;
  }
  return { entries, classes, classAttributes, classesWithin, classReports, tokens, tokenNames };
}

const cache = new Map();

/** The normalized map at `path` (the bundled v1 map by default), read and checked once per path. */
export function loadMap(path = defaultMapPath) {
  const file = resolve(path);
  if (!cache.has(file)) {
    const parsed = readMap(file);
    const problems = validateMap(parsed);
    if (problems.length > 0)
      throw new Error(`The rename map ${file} is malformed:\n- ${problems.join('\n- ')}`);
    cache.set(file, normalizeMap(parsed));
  }
  return cache.get(file);
}
