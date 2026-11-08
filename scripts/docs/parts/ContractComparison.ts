// What a part contract lost against the one on the integration branch, and whether a major
// changeset names each removal: part classes, state attributes and color properties are public, so
// one that goes is a breaking change.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { baseCandidates } from '../../test/TestScope.ts';
import { partsPath, type PartsContract } from './Contract.ts';
import { root } from './Library.ts';

const changesetDirectory = resolve(root, '.changeset');

/** A name of a contract: a part, a color property, a state attribute, or one of its values. */
interface ContractItem {
  name: string;
  part?: string;
  color?: string;
  attribute?: string;
  parts?: string[];
  value?: string;
}

/**
 * Every part class, state attribute value and color property of a contract, as `Group: name`
 * labels, with the class, attribute or property each names, the value of a state value, and the
 * parts that carry a state.
 */
function contractNames(parts: PartsContract | undefined) {
  const names = new Map<string, ContractItem>();
  for (const kind of ['components', 'shared'] as const)
    for (const [group, entry] of Object.entries(parts?.[kind] ?? {})) {
      for (const part of entry.parts)
        names.set(`${group}: .${part.class}`, { name: part.class, part: part.class });
      for (const { property } of [...(entry.colors ?? []), ...(entry.properties ?? [])])
        names.set(`${group}: ${property}`, { name: property, color: property });
      for (const state of entry.states) {
        const carried = { name: state.attribute, attribute: state.attribute, parts: state.parts };
        names.set(`${group}: [${state.attribute}]`, carried);
        for (const value of state.values)
          names.set(`${group}: [${state.attribute}='${value}']`, { ...carried, value });
      }
    }
  return names;
}

/**
 * Each class of a contract, the values each class's state attributes take (null: any) and its color
 * properties.
 */
function contractClasses(parts: PartsContract | undefined) {
  const classes = new Set<string>();
  /** Each part's state attribute and the values it takes, null for any. */
  const states = new Map<string, Set<string> | null>();
  const colors = new Set<string>();
  for (const kind of ['components', 'shared'] as const)
    for (const entry of Object.values(parts?.[kind] ?? {})) {
      for (const part of entry.parts) classes.add(part.class);
      for (const { property } of [...(entry.colors ?? []), ...(entry.properties ?? [])])
        colors.add(property);
      for (const state of entry.states)
        for (const part of state.parts ?? []) {
          const key = `${part} ${state.attribute}`;
          const known = states.get(key);
          states.set(
            key,
            known === null || !state.values.length
              ? null
              : new Set([...(known ?? []), ...state.values]),
          );
        }
    }
  return { classes, states, colors };
}

/** Whether a changeset's front matter makes it a major change of @envsemble/envui. */
const isMajor = (changeset: string) =>
  /^---\r?\n[\s\S]*?^\s*['"]?@envsemble\/envui['"]?\s*:\s*major\s*$[\s\S]*?^---/m.test(changeset);
/** Whether a text names a name whole, so a changeset about env-card-header doesn't name env-card. */
const names = (text: string, name: string) =>
  new RegExp(String.raw`(?<![\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\w-])`).test(
    text,
  );

/**
 * What a contract lost against an older one: each part, state attribute or value, or color property
 * that is gone, with whether a major changeset of @envsemble/envui names it: the class; the
 * attribute; the property; or, for a value, the attribute and the value. A part that moved to another group, or a state value whose
 * attribute now takes any value, is not gone. Pure, for the tests; `changesets` is the text of each
 * pending changeset.
 */
export function removedParts(
  before: PartsContract | undefined,
  after: PartsContract,
  changesets: string | string[] = [],
) {
  const now = contractNames(after);
  const kept = contractClasses(after);
  const major = (Array.isArray(changesets) ? changesets : [changesets]).filter(isMajor);
  /** Whether a part, attribute or value is still there, in this group or another. */
  const stays = (item: ContractItem) => {
    if (item.part) return kept.classes.has(item.part);
    if (item.color) return kept.colors.has(item.color);
    return (item.parts ?? []).some((part) => {
      const values = kept.states.get(`${part} ${item.attribute}`);
      if (values === undefined) return false;
      return item.value === undefined || values === null || values.has(item.value);
    });
  };
  const removed: { label: string; name: string; recorded: boolean }[] = [];
  for (const [label, item] of contractNames(before))
    if (!now.has(label) && !stays(item))
      removed.push({
        label,
        name: item.name,
        recorded: major.some(
          (text) =>
            names(text, item.name) &&
            // A value takes its attribute and the value; "" is the attribute set without one.
            (item.value === undefined || item.value === '' || names(text, item.value)),
        ),
      });
  return removed;
}

function git(args: string[]) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/**
 * The contract at the merge-base with the integration branch, from the first of the check tiers'
 * bases whose merge-base has it, and what each base skipped lacked.
 */
export function baseParts(base: string | undefined): {
  ref: string | undefined;
  parts: PartsContract | undefined;
  skipped: string[];
} {
  const skipped: string[] = [];
  for (const ref of baseCandidates(base)) {
    let mergeBase: string;
    try {
      mergeBase = git(['merge-base', 'HEAD', ref]).trim();
    } catch {
      skipped.push(`${ref} does not exist here`);
      continue;
    }
    try {
      return { ref, parts: JSON.parse(git(['show', `${mergeBase}:${partsPath}`])), skipped };
    } catch {
      skipped.push(`${ref} has no ${partsPath} at the merge-base ${mergeBase.slice(0, 10)}`);
    }
  }
  return { ref: undefined, parts: undefined, skipped };
}

/** The pending changesets' text, one per changeset, of which a major one must name a removal. */
export function pendingChangesets() {
  if (!existsSync(changesetDirectory)) return [];
  return readdirSync(changesetDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => readFileSync(resolve(changesetDirectory, name), 'utf8'));
}
