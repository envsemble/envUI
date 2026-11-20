import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { kebab, type PropsFile } from '../PageStructure.ts';
import { fields, mapOf, oneOf, optional, text } from '../Shapes.ts';
import {
  librarySourceDirectory,
  partsFile,
  propsFile,
  repositoryPath,
} from '../../RepositoryPaths.ts';
import { styleSheets } from './Library.ts';
import { readSource } from './SourceExtraction.ts';
import { readColorProperties, readStyles } from './StyleExtraction.ts';

interface PartsEntry {
  root: string | null;
  source?: string;
  parts: { class: string; description: string | null; slot?: true }[];
  states: { attribute: string; values: string[]; parts: string[] }[];
  uses?: string[];
  usedBy?: string[];
  colors?: { property: string; description: string }[];
  properties?: { property: string; use: 'set' | 'read'; description: string }[];
}

export interface PartsContract {
  $comment?: string;
  schemaVersion?: number;
  components: Record<string, PartsEntry>;
  shared: Record<string, PartsEntry>;
}

export const partsPath = repositoryPath(partsFile);
const partDescriptionsFile = resolve(librarySourceDirectory, 'partDescriptions.json');

const partsSchemaVersion = 1;

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

interface PartDescriptions {
  roots?: Record<string, string>;
  prefixes?: Record<string, string>;
  shared?: Record<string, { prefix: string; root?: string }>;
  placed?: Record<string, string>;
  descriptions?: Record<string, Record<string, string>>;
  colors?: Record<string, Record<string, string>>;
  properties?: Record<string, Record<string, { use: 'set' | 'read'; description: string }>>;
}

const texts = optional(mapOf(text));
const readDescriptions = fields<PartDescriptions>({
  roots: texts,
  prefixes: texts,
  shared: optional(mapOf(fields({ prefix: text, root: optional(text) }))),
  placed: texts,
  descriptions: optional(mapOf(mapOf(text))),
  colors: optional(mapOf(mapOf(text))),
  properties: optional(
    mapOf(mapOf(fields({ use: oneOf(['set', 'read'] as const), description: text }))),
  ),
});

const readPartDescriptions = () =>
  readDescriptions(JSON.parse(readFileSync(partDescriptionsFile, 'utf8')), 'partDescriptions.json');

interface Group {
  name: string;
  prefix: string;
  source?: string;
  root?: string | null;
  shared: boolean;
}

interface GroupState {
  values: Set<string>;
  free: boolean;
  parts: Set<string>;
}

type SourceReading = ReturnType<typeof readSource>;
type StateReading = SourceReading['states'][number] | ReturnType<typeof readStyles>[number];

function readGroups(props: PropsFile, source: PartDescriptions) {
  const groups = new Map<string, Group>();
  for (const [name, entry] of Object.entries(props.exports)) {
    if (name.includes('.') || !['component', 'namespace'].includes(entry.kind)) continue;
    const prefix = source.prefixes?.[name] ?? `env-${kebab(name)}`;
    groups.set(name, { name, prefix, source: entry.source, shared: false });
  }
  for (const [name, entry] of Object.entries(source.shared ?? {}))
    groups.set(name, { name, prefix: entry.prefix, root: entry.root ?? null, shared: true });
  return groups;
}

function placeClasses(
  classes: SourceReading['classes'],
  groups: Map<string, Group>,
  groupOf: (name: string) => string | undefined,
  problems: string[],
) {
  const members = new Map<string, string[]>();
  for (const name of [...classes.keys()].sort(byText)) {
    const group = groupOf(name);
    if (!group || !groups.has(group)) {
      problems.push(
        `${name} belongs to no component: add it to "placed" in packages/ui/src/partDescriptions.json`,
      );
      continue;
    }
    members.set(group, [...(members.get(group) ?? []), name]);
  }
  return members;
}

function groupStatesOf(
  states: StateReading[],
  classes: SourceReading['classes'],
  groupOf: (name: string) => string | undefined,
) {
  const groupStates = new Map<string, Map<string, GroupState>>();
  for (const state of states) {
    for (const name of state.classes ?? []) {
      if (!classes.has(name)) continue;
      const group = groupOf(name)!;
      const byAttribute = groupStates.get(group) ?? new Map<string, GroupState>();
      const entry = byAttribute.get(state.attribute) ?? {
        values: new Set<string>(),
        free: false,
        parts: new Set<string>(),
      };
      if (state.values === undefined) entry.free = true;
      else for (const value of state.values) entry.values.add(value);
      entry.parts.add(name);
      byAttribute.set(state.attribute, entry);
      groupStates.set(group, byAttribute);
    }
  }
  return groupStates;
}

function reachableFrom(
  start: string,
  imports: SourceReading['imports'],
  componentSources: Set<string | undefined>,
) {
  const found = new Set([start]);
  const queue = [start];
  for (let file = queue.shift(); file !== undefined; file = queue.shift())
    for (const next of imports.get(file) ?? [])
      if (!found.has(next) && !componentSources.has(next)) {
        found.add(next);
        queue.push(next);
      }
  return found;
}

function checkProperties(
  properties: NonNullable<PartDescriptions['properties']>,
  problems: string[],
) {
  const styleText = styleSheets()
    .map(({ css }) => css)
    .join('\n');
  for (const [group, list] of Object.entries(properties))
    for (const [property, { description }] of Object.entries(list)) {
      if (!new RegExp(`${property}(?![\\w-])`).test(styleText))
        problems.push(`${group}: its property ${property} is in none of the style sheets`);
      if (!description.trim())
        problems.push(
          `${group}: ${property} has no description in packages/ui/src/partDescriptions.json`,
        );
    }
}

function checkColors(colors: Record<string, Record<string, string>>, problems: string[]) {
  const registered = readColorProperties();
  const listedColors = new Set<string>();
  for (const [group, list] of Object.entries(colors))
    for (const [property, description] of Object.entries(list)) {
      listedColors.add(property);
      if (!registered.has(property))
        problems.push(
          `${group}: its color property ${property} is not registered in the style sheets as a property that doesn't inherit`,
        );
      if (!description.trim())
        problems.push(
          `${group}: ${property} has no description in packages/ui/src/partDescriptions.json`,
        );
    }
  for (const property of registered.keys())
    if (!listedColors.has(property))
      problems.push(
        `${property}, registered in ${registered.get(property)}, is listed under no component's colors in packages/ui/src/partDescriptions.json`,
      );
}

function checkDescriptions(
  group: string,
  parts: string[],
  described: Record<string, string>,
  problems: string[],
) {
  for (const name of parts)
    if (typeof described[name] !== 'string' || !described[name].trim())
      problems.push(
        `${group}: ${name} has no description in packages/ui/src/partDescriptions.json`,
      );
  for (const name of Object.keys(described))
    if (!parts.includes(name))
      problems.push(
        `${group}: ${name} is described in packages/ui/src/partDescriptions.json but is not one of its parts`,
      );
}

function checkListedGroups(
  output: Pick<PartsContract, 'components' | 'shared'>,
  { properties, colors, descriptions }: Record<'properties' | 'colors' | 'descriptions', object>,
  problems: string[],
) {
  for (const name of Object.keys(properties))
    if (!(name in output.components) && !(name in output.shared))
      problems.push(
        `packages/ui/src/partDescriptions.json lists properties of ${name}, which is no component`,
      );
  for (const name of Object.keys(colors))
    if (!(name in output.components))
      problems.push(
        `packages/ui/src/partDescriptions.json lists colors of ${name}, which is no component`,
      );
  for (const name of Object.keys(descriptions))
    if (!(name in output.components) && !(name in output.shared))
      problems.push(`packages/ui/src/partDescriptions.json describes ${name}, which has no parts`);
}

export function buildParts({
  source = readPartDescriptions(),
  props = JSON.parse(readFileSync(propsFile, 'utf8')),
}: { source?: PartDescriptions; props?: PropsFile } = {}) {
  const {
    classes,
    slots,
    states: sourceStates,
    imports,
    renders,
    warnings,
    written,
    writtenToDataset,
  } = readSource();
  const problems = [...warnings];

  const groups = readGroups(props, source);
  const byPrefix = [...groups.values()].sort((a, b) => b.prefix.length - a.prefix.length);
  const groupOf = (name: string): string | undefined =>
    source.placed?.[name] ??
    byPrefix.find((group) => name === group.prefix || name.startsWith(`${group.prefix}-`))?.name;
  const members = placeClasses(classes, groups, groupOf, problems);
  const groupStates = groupStatesOf([...sourceStates, ...readStyles()], classes, groupOf);
  const filesOfMembers = (group: string) =>
    (members.get(group) ?? []).flatMap((name) => [...classes.get(name)!.files]);

  const filesOf = new Map<string, Set<string>>();
  for (const name of members.keys())
    for (const file of filesOfMembers(name))
      filesOf.set(file, new Set([...(filesOf.get(file) ?? []), name]));
  const componentSources = new Set(
    [...groups.values()].map((group) => group.source).filter(Boolean),
  );
  const reachable = (start: string) => reachableFrom(start, imports, componentSources);
  const groupsBySource = new Map<string, string[]>();
  for (const group of groups.values())
    if (group.source && (members.get(group.name)?.length ?? 0) > 0)
      groupsBySource.set(group.source, [...(groupsBySource.get(group.source) ?? []), group.name]);

  for (const group of groups.values()) {
    const states = groupStates.get(group.name);
    if (!states) continue;
    const own = new Set([...(group.source ? [group.source] : []), ...filesOfMembers(group.name)]);
    const imported = group.source
      ? reachable(group.source)
      : new Set([...own].flatMap((file) => [...reachable(file)]));
    for (const [attribute, entry] of states) {
      if (entry.free) continue;
      const found = [
        ...[...own].map((file) => written.get(file)?.get(attribute)),
        ...[...imported].map((file) => writtenToDataset.get(file)?.get(attribute)),
      ];
      for (const values of found) if (values) for (const value of values) entry.values.add(value);
    }
  }

  const properties = source.properties ?? {};
  checkProperties(properties, problems);
  const descriptions = source.descriptions ?? {};
  const colors = source.colors ?? {};
  checkColors(colors, problems);

  const usesOf = (group: Group) => {
    const uses = new Set<string>();
    if (group.source)
      for (const file of reachable(group.source)) {
        for (const other of filesOf.get(file) ?? [])
          if (groups.get(other)!.source !== group.source) uses.add(other);
        for (const { source: next, names, namespace } of renders.get(file) ?? [])
          if (next !== group.source)
            for (const other of groupsBySource.get(next) ?? [])
              if (namespace || names.includes(other)) uses.add(other);
      }
    return uses;
  };
  const output: Pick<PartsContract, 'components' | 'shared'> = { components: {}, shared: {} };
  const usedBy = new Map<string, Set<string>>();
  for (const group of [...groups.values()].sort((a, b) => byText(a.name, b.name))) {
    const list = members.get(group.name) ?? [];
    const rootClass =
      source.roots?.[group.name] ??
      (group.shared ? (group.root ?? null) : list.includes(group.prefix) ? group.prefix : null);
    if (!list.length && !rootClass) continue;
    if (rootClass && !classes.has(rootClass))
      problems.push(`${group.name}: its root ${rootClass} is not a class of the library`);
    const described: Record<string, string> = descriptions[group.name] ?? {};
    checkDescriptions(group.name, list, described, problems);
    const ordered = [...list].sort((a, b) =>
      a === rootClass ? -1 : b === rootClass ? 1 : byText(a, b),
    );
    const uses = usesOf(group);
    for (const name of uses) usedBy.set(name, new Set([...(usedBy.get(name) ?? []), group.name]));
    const entry: PartsEntry = {
      root: rootClass,
      ...(group.source && { source: group.source }),
      parts: ordered.map((name) => ({
        class: name,
        description: described[name] ?? null,
        ...(slots.has(name) && { slot: true as const }),
      })),
      states: [...(groupStates.get(group.name) ?? new Map<string, GroupState>())]
        .sort(([a], [b]) => byText(a, b))
        .map(([attribute, { values, free, parts }]) => ({
          attribute,
          values: free ? [] : [...values].sort(byText),
          parts: [...parts].sort(byText),
        })),
      ...(uses.size && { uses: [...uses].sort(byText) }),
      ...(colors[group.name] && {
        colors: Object.entries(colors[group.name]).map(([property, description]) => ({
          property,
          description,
        })),
      }),
      ...(properties[group.name] && {
        properties: Object.entries(properties[group.name]).map(
          ([property, { use, description }]) => ({ property, use, description }),
        ),
      }),
    };
    (group.shared ? output.shared : output.components)[group.name] = entry;
  }
  for (const [name, entry] of Object.entries(output.shared))
    entry.usedBy = [...(usedBy.get(name) ?? [])].sort(byText);
  checkListedGroups(output, { properties, colors, descriptions }, problems);

  return {
    parts: {
      $comment:
        'Generated by scripts/docs/GenerateParts.ts from packages/ui/src and the descriptions in packages/ui/src/partDescriptions.json; do not edit. Part classes, state attributes and color properties are public and versioned. A part marked slot holds what a prop gives it, placed and never styled: style sheets don’t reach inside it. In a state, values lists what the attribute takes; "" is an attribute set without a value, and an empty list one that takes any value or is selected by its presence alone. colors lists the custom properties that set a component’s colors on one instance, through style or CSS; they don’t inherit.',
      schemaVersion: partsSchemaVersion,
      ...output,
    },
    problems,
  };
}

export function serializeParts(parts: PartsContract) {
  return `${JSON.stringify(parts, null, 2)}\n`;
}
