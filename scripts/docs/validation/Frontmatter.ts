// Checking a page's frontmatter against its kind's schema.
import {
  exampleFields,
  exampleRoles,
  frontmatterSchema,
  guideExportStatus,
  otherFrontmatter,
  pageSchemas,
  type ExampleEntry,
  type Frontmatter,
  type FrontmatterSchema,
} from '../PageStructure.ts';
import { pageStatuses } from '../model/DocumentationTypes.ts';
import { deviceKinds, stageFills } from './Figures.ts';

/** What a page's frontmatter is checked against: its kind, and the versions its since may name. */
export interface FrontmatterContext {
  kind: string;
  /** The released versions and the next one; without them, since goes unchecked. */
  versions?: Set<string>;
}

type FrontmatterRule = FrontmatterSchema[string];

const isMap = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** The exports the frontmatter's components lists, or none when it lists none. */
const listedComponents = (frontmatter: Frontmatter): unknown[] =>
  Array.isArray(frontmatter.components) ? frontmatter.components : [];

/**
 * The problems of a guide's exportAliases: the names people search for an export by, for an
 * export without a component page of its own, such as "theme switcher" for ThemeToggle, a list per
 * export the page documents.
 */
function exportAliasesProblems(frontmatter: Frontmatter) {
  const value = frontmatter.exportAliases;
  if (!isMap(value)) return ['exportAliases must map an export to its aliases'];
  const problems: string[] = [];
  for (const [name, aliases] of Object.entries(value)) {
    if (!listedComponents(frontmatter).includes(name))
      problems.push(`exportAliases names ${name}, which components does not list`);
    if (
      !Array.isArray(aliases) ||
      !aliases.length ||
      aliases.some((alias) => typeof alias !== 'string' || !alias.trim()) ||
      new Set(aliases).size !== aliases.length
    )
      problems.push(`exportAliases of ${name} must be a list of distinct strings`);
  }
  return problems;
}

/** The problems of one example entry of `examples`, a role or a role with its figure's options. */
function exampleProblems(key: string, name: string, entry: string | Partial<ExampleEntry> | null) {
  const problems: string[] = [];
  const { role, caption, open, stage, motion, wide, device }: Partial<ExampleEntry> =
    typeof entry === 'string' ? { role: entry } : (entry ?? {});
  if (!/^[A-Z][A-Za-z\d]*$/.test(name))
    problems.push(`${key} names ${name}; name an example by its PascalCase file name`);
  if (!exampleRoles.includes(role ?? ''))
    problems.push(`${key} gives ${name} the role ${role}; one of ${exampleRoles.join(', ')}`);
  if (
    entry &&
    typeof entry === 'object' &&
    Object.keys(entry).some((field) => !exampleFields.includes(field))
  )
    problems.push(`${key} gives ${name} a field other than ${exampleFields.join(', ')}`);
  // An overview is framed here, since no fence places it; other figures on their fence.
  if (
    [open, stage, motion, wide, device].some((option) => option !== undefined) &&
    role !== 'overview'
  )
    problems.push(
      `${key} gives ${name} open, stage, motion, wide or device, which only an overview example takes here; write them on its fence`,
    );
  if (device !== undefined && !deviceKinds.includes(device))
    problems.push(
      `${key} gives ${name} device: ${device}; a device is ${deviceKinds.join(' or ')}, or nothing for the stage alone`,
    );
  if (device !== undefined && open !== undefined)
    problems.push(`${key} gives ${name} device and open; a figure on a device is closed`);
  for (const [option, value] of Object.entries({ open, motion, wide }))
    if (value !== undefined && value !== true)
      problems.push(
        `${key} gives ${name} ${option}: ${value}; write ${option}: true, or leave it out`,
      );
  if (stage !== undefined && !stageFills.includes(stage))
    problems.push(
      `${key} gives ${name} stage: ${stage}; a stage takes ${stageFills.join(', ')}, or nothing for the stage in the page's color`,
    );
  if (caption !== undefined && (typeof caption !== 'string' || !caption.trim()))
    problems.push(`${key} gives ${name} an empty caption`);
  if ((role === 'do' || role === 'dont' || role === 'caution') && !caption)
    problems.push(`${key} gives the ${role} figure ${name} no caption, its rule`);
  return problems;
}

/** The problems of `statuses`: each export's status where it differs from the page's. */
function statusesProblems(
  key: string,
  value: unknown,
  frontmatter: Frontmatter,
  schema: FrontmatterSchema | undefined,
) {
  if (!isMap(value)) return [`${key} must map an export to its status`];
  const problems: string[] = [];
  for (const [name, status] of Object.entries(value)) {
    if (!listedComponents(frontmatter).includes(name))
      problems.push(`${key} names ${name}, which components does not list`);
    if (!(pageStatuses as readonly unknown[]).includes(status))
      problems.push(`${key} of ${name} must be one of ${pageStatuses.join(', ')}`);
    else if (status === (schema ? frontmatter.status : (frontmatter.status ?? guideExportStatus)))
      problems.push(
        schema || frontmatter.status
          ? `${key} of ${name} repeats the page's status; leave it out`
          : `${key} of ${name} repeats the default status of a guide's exports, ${guideExportStatus}; leave it out`,
      );
  }
  return problems;
}

/** The problems of a field's value under its rule. */
function fieldProblems(
  key: string,
  value: unknown,
  rule: FrontmatterRule,
  frontmatter: Frontmatter,
  schema: FrontmatterSchema | undefined,
): string[] {
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string' || !value.trim()) return [`${key} must be a string`];
      if (rule.values && !rule.values.includes(value))
        return [`${key} must be one of ${rule.values.join(', ')}`];
      if (rule.pattern && !rule.pattern.test(value)) return [`${key} must match ${rule.pattern}`];
      return [];
    case 'strings':
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim()))
        return [`${key} must be a list of strings`];
      return new Set(value).size !== value.length ? [`${key} repeats an entry`] : [];
    case 'avoid':
      return !Array.isArray(value) || value.some((item) => !isAvoidEntry(item))
        ? [
            `${key} must be a list of { text, use } or { text, see } entries, use naming the export to use instead and see the page to read instead`,
          ]
        : [];
    case 'examples':
      if (!isMap(value))
        return [`${key} must map each example's name to its role, or to its role and caption`];
      return Object.entries(value).flatMap(([name, entry]) =>
        // Each field of an entry is checked as exampleProblems reads it.
        exampleProblems(key, name, entry as string | Partial<ExampleEntry> | null),
      );
    case 'statuses':
      return statusesProblems(key, value, frontmatter, schema);
  }
}

/** Whether an avoidWhen entry is `{ text, use }` or `{ text, see }`, each a non-empty string. */
function isAvoidEntry(item: unknown) {
  if (!isMap(item)) return false;
  const filled = (field: unknown) => typeof field === 'string' && Boolean(field.trim());
  return (
    filled(item.text) &&
    (!('use' in item) || filled(item.use)) &&
    (!('see' in item) || filled(item.see)) &&
    'use' in item !== 'see' in item &&
    Object.keys(item).every((field) => ['text', 'use', 'see'].includes(field))
  );
}

/**
 * The problems of a page of a structured kind as a whole: its required and non-empty fields, its
 * summary a sentence, its since a version, and namespaces rather than parts in its lists.
 */
function schemaProblems(
  frontmatter: Frontmatter,
  schema: FrontmatterSchema,
  versions: Set<string> | undefined,
) {
  const problems: string[] = [];
  for (const [key, rule] of Object.entries(schema)) {
    if (rule.required && !(key in frontmatter)) problems.push(`${key} is required`);
    if (rule.nonEmpty && Array.isArray(frontmatter[key]) && !frontmatter[key].length)
      problems.push(`${key} must not be empty`);
  }
  if (typeof frontmatter.summary === 'string' && !/[.!?]$/.test(frontmatter.summary.trim()))
    problems.push('summary must be a sentence ending with a full stop');
  if (
    versions &&
    schema.since?.pattern &&
    typeof frontmatter.since === 'string' &&
    schema.since.pattern.test(frontmatter.since) &&
    !versions.has(frontmatter.since)
  )
    problems.push(
      `since ${frontmatter.since} is neither a released version nor the next one (${[...versions].join(', ')})`,
    );
  for (const name of listedComponents(frontmatter))
    if (typeof name === 'string' && name.includes('.'))
      problems.push(
        `components lists ${name}, a part: list its namespace, ${name.split('.')[0]}, whose page documents its parts`,
      );
  for (const name of Array.isArray(frontmatter.composes) ? frontmatter.composes : [])
    if (typeof name === 'string' && name.includes('.'))
      problems.push(`composes lists ${name}, a part: list its namespace, ${name.split('.')[0]}`);
  return problems;
}

/** Checks a page's frontmatter against its kind's schema, throwing with every problem it has. */
export function validateFrontmatter(
  frontmatter: Frontmatter,
  path: string,
  { kind, versions }: FrontmatterContext,
) {
  const problems: string[] = [];
  const schema = pageSchemas[kind];
  if (!schema) {
    for (const key of Object.keys(frontmatter))
      if (!otherFrontmatter.has(key))
        problems.push(
          `${key} is not allowed here; only status, components, aliases, exportAliases and statuses are`,
        );
    if ('exportAliases' in frontmatter) problems.push(...exportAliasesProblems(frontmatter));
  }
  for (const [key, value] of Object.entries(frontmatter)) {
    if (key === 'exportAliases' && !schema) continue;
    const rule = (schema ?? frontmatterSchema)[key];
    if (!rule) problems.push(`unknown field ${key}`);
    else problems.push(...fieldProblems(key, value, rule, frontmatter, schema));
  }
  if (schema) problems.push(...schemaProblems(frontmatter, schema, versions));
  if (problems.length)
    throw new Error(`Invalid frontmatter in ${path}:\n  - ${problems.join('\n  - ')}`);
}
