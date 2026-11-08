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
} from '../Schema.ts';
import { pageStatuses } from '../model/DocumentationTypes.ts';
import { deviceKinds, stageFills } from './Figures.ts';

/** What a page's frontmatter is checked against: its kind, and the versions its since may name. */
export interface FrontmatterContext {
  kind: string;
  /** The released versions and the next one; without them, since goes unchecked. */
  versions?: Set<string>;
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
  }
  if (!schema && 'exportAliases' in frontmatter) {
    // The names people search for an export by, for an export without a component page of its
    // own, such as "theme switcher" for ThemeToggle: a list per export the page documents.
    const value = frontmatter.exportAliases;
    const listed = Array.isArray(frontmatter.components) ? frontmatter.components : [];
    if (!value || typeof value !== 'object' || Array.isArray(value))
      problems.push('exportAliases must map an export to its aliases');
    else
      for (const [name, aliases] of Object.entries(value)) {
        if (!listed.includes(name))
          problems.push(`exportAliases names ${name}, which components does not list`);
        if (
          !Array.isArray(aliases) ||
          !aliases.length ||
          aliases.some((alias) => typeof alias !== 'string' || !alias.trim()) ||
          new Set(aliases).size !== aliases.length
        )
          problems.push(`exportAliases of ${name} must be a list of distinct strings`);
      }
  }
  for (const [key, value] of Object.entries(frontmatter)) {
    if (key === 'exportAliases' && !schema) continue;
    const rule = (schema ?? frontmatterSchema)[key];
    if (!rule) {
      problems.push(`unknown field ${key}`);
      continue;
    }
    if (rule.type === 'string') {
      if (typeof value !== 'string' || !value.trim()) problems.push(`${key} must be a string`);
      else if (rule.values && !rule.values.includes(value))
        problems.push(`${key} must be one of ${rule.values.join(', ')}`);
      else if (rule.pattern && !rule.pattern.test(value))
        problems.push(`${key} must match ${rule.pattern}`);
    } else if (rule.type === 'strings') {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim()))
        problems.push(`${key} must be a list of strings`);
      else if (new Set(value).size !== value.length) problems.push(`${key} repeats an entry`);
    } else if (rule.type === 'avoid') {
      if (
        !Array.isArray(value) ||
        value.some(
          (item) =>
            !item ||
            typeof item !== 'object' ||
            typeof item.text !== 'string' ||
            !item.text.trim() ||
            ('use' in item && (typeof item.use !== 'string' || !item.use.trim())) ||
            ('see' in item && (typeof item.see !== 'string' || !item.see.trim())) ||
            'use' in item === 'see' in item ||
            Object.keys(item).some((field) => !['text', 'use', 'see'].includes(field)),
        )
      )
        problems.push(
          `${key} must be a list of { text, use } or { text, see } entries, use naming the export to use instead and see the page to read instead`,
        );
    } else if (rule.type === 'examples') {
      if (!value || typeof value !== 'object' || Array.isArray(value))
        problems.push(
          `${key} must map each example's name to its role, or to its role and caption`,
        );
      else
        for (const [name, entry] of Object.entries<string | Partial<ExampleEntry> | null>(value)) {
          const { role, caption, open, stage, motion, wide, device }: Partial<ExampleEntry> =
            typeof entry === 'string' ? { role: entry } : (entry ?? {});
          if (!/^[A-Z][A-Za-z\d]*$/.test(name))
            problems.push(`${key} names ${name}; name an example by its PascalCase file name`);
          if (!exampleRoles.includes(role ?? ''))
            problems.push(
              `${key} gives ${name} the role ${role}; one of ${exampleRoles.join(', ')}`,
            );
          if (
            entry &&
            typeof entry === 'object' &&
            Object.keys(entry).some((field) => !exampleFields.includes(field))
          )
            problems.push(`${key} gives ${name} a field other than ${exampleFields.join(', ')}`);
          // An overview is framed here, since no fence places it; other figures on their fence.
          if (
            (open !== undefined ||
              stage !== undefined ||
              motion !== undefined ||
              wide !== undefined ||
              device !== undefined) &&
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
          if (open !== undefined && open !== true)
            problems.push(`${key} gives ${name} open: ${open}; write open: true, or leave it out`);
          if (motion !== undefined && motion !== true)
            problems.push(
              `${key} gives ${name} motion: ${motion}; write motion: true, or leave it out`,
            );
          if (wide !== undefined && wide !== true)
            problems.push(`${key} gives ${name} wide: ${wide}; write wide: true, or leave it out`);
          if (stage !== undefined && !stageFills.includes(stage))
            problems.push(
              `${key} gives ${name} stage: ${stage}; a stage takes ${stageFills.join(', ')}, or nothing for the stage in the page's color`,
            );
          if (caption !== undefined && (typeof caption !== 'string' || !caption.trim()))
            problems.push(`${key} gives ${name} an empty caption`);
          if ((role === 'do' || role === 'dont' || role === 'caution') && !caption)
            problems.push(`${key} gives the ${role} figure ${name} no caption, its rule`);
        }
    } else if (rule.type === 'statuses') {
      const listed = Array.isArray(frontmatter.components) ? frontmatter.components : [];
      if (!value || typeof value !== 'object' || Array.isArray(value))
        problems.push(`${key} must map an export to its status`);
      else
        for (const [name, status] of Object.entries<unknown>(value)) {
          if (!listed.includes(name))
            problems.push(`${key} names ${name}, which components does not list`);
          if (!(pageStatuses as readonly unknown[]).includes(status))
            problems.push(`${key} of ${name} must be one of ${pageStatuses.join(', ')}`);
          else if (
            status === (schema ? frontmatter.status : (frontmatter.status ?? guideExportStatus))
          )
            problems.push(
              schema || frontmatter.status
                ? `${key} of ${name} repeats the page's status; leave it out`
                : `${key} of ${name} repeats the default status of a guide's exports, ${guideExportStatus}; leave it out`,
            );
        }
    }
  }
  if (schema) {
    for (const [key, rule] of Object.entries(schema)) {
      if (rule.required && !(key in frontmatter)) problems.push(`${key} is required`);
      if (rule.nonEmpty && Array.isArray(frontmatter[key]))
        if (!frontmatter[key].length) problems.push(`${key} must not be empty`);
    }
    if (typeof frontmatter.summary === 'string' && !/[.!?]$/.test(frontmatter.summary.trim()))
      problems.push('summary must be a sentence ending with a full stop');
    if (
      versions &&
      schema.since &&
      typeof frontmatter.since === 'string' &&
      frontmatter.since.match(schema.since.pattern!) &&
      !versions.has(frontmatter.since)
    )
      problems.push(
        `since ${frontmatter.since} is neither a released version nor the next one (${[...versions].join(', ')})`,
      );
    for (const name of Array.isArray(frontmatter.components) ? frontmatter.components : [])
      if (typeof name === 'string' && name.includes('.'))
        problems.push(
          `components lists ${name}, a part: list its namespace, ${name.split('.')[0]}, whose page documents its parts`,
        );
    for (const name of Array.isArray(frontmatter.composes) ? frontmatter.composes : [])
      if (typeof name === 'string' && name.includes('.'))
        problems.push(`composes lists ${name}, a part: list its namespace, ${name.split('.')[0]}`);
  }
  if (problems.length)
    throw new Error(`Invalid frontmatter in ${path}:\n  - ${problems.join('\n  - ')}`);
}
