import { recordsBreakingChange, names } from '../ContractHistory.ts';
import type { PartsContract } from './Contract.ts';

interface ContractItem {
  name: string;
  part?: string;
  color?: string;
  attribute?: string;
  parts?: string[];
  value?: string;
}

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

function contractClasses(parts: PartsContract | undefined) {
  const classes = new Set<string>();
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

export function removedParts(
  before: PartsContract | undefined,
  after: PartsContract,
  changesets: string | string[] = [],
  released?: PartsContract,
) {
  const now = contractNames(after);
  const shipped = released && [...contractNames(released).values()];
  const wasReleased = (item: ContractItem) =>
    !shipped ||
    shipped.some(
      (each) =>
        each.name === item.name &&
        each.value === item.value &&
        Boolean(each.part) === Boolean(item.part) &&
        Boolean(each.color) === Boolean(item.color),
    );
  const kept = contractClasses(after);
  const major = (Array.isArray(changesets) ? changesets : [changesets]).filter(
    recordsBreakingChange,
  );
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
    if (!now.has(label) && !stays(item) && wasReleased(item))
      removed.push({
        label,
        name: item.name,
        recorded: major.some(
          (text) =>
            names(text, item.name) &&
            (item.value === undefined || item.value === '' || names(text, item.value)),
        ),
      });
  return removed;
}
