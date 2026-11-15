import { roundToHundredth } from '../internal/dom/lengths.js';

export interface ContainerQuery {
  container: string;
  condition: string;
  rules: number;
  thresholds: number[];
}

interface RuleLike {
  cssRules?: ArrayLike<RuleLike>;
  selectorText?: string;
  containerName?: string;
  containerQuery?: string;
  conditionText?: string;
}

const isContainerRule = (rule: RuleLike) =>
  typeof rule.containerName === 'string' && typeof rule.conditionText === 'string';

/** @internal */
export function thresholdsOf(condition: string, rootPx: number): number[] {
  const widths = new Set<number>();
  for (const match of condition.matchAll(/(\d*\.?\d+)(rem|em|px)\b/g)) {
    const value = Number(match[1]);
    widths.add(roundToHundredth(match[2] === 'px' ? value / rootPx : value));
  }
  return [...widths].sort((a, b) => a - b);
}

export function conditionHolds(
  condition: string,
  widthRem: number,
  rootPx: number,
): boolean | null {
  const toRem = (value: string, unit: string) =>
    unit === 'px' ? Number(value) / rootPx : Number(value);
  const compare = (left: number, operator: string, right: number) =>
    operator === '>='
      ? left >= right
      : operator === '>'
        ? left > right
        : operator === '<='
          ? left <= right
          : operator === '<'
            ? left < right
            : left === right;
  const flip: Record<string, string> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=', '=': '=' };
  const feature = '(?:inline-size|width)';
  const length = '(\\d*\\.?\\d+)(rem|em|px)';
  const test = (part: string): boolean | null => {
    const text = part.trim();
    const negated = /^not\s+/.exec(text);
    if (negated) {
      const inner = test(text.slice(negated[0].length));
      return inner === null ? null : !inner;
    }
    let match = new RegExp(
      `^\\(\\s*${length}\\s*(<=|<|>=|>|=)\\s*${feature}\\s*(<=|<|>=|>|=)\\s*${length}\\s*\\)$`,
    ).exec(text);
    if (match)
      return (
        compare(toRem(match[1], match[2]), match[3], widthRem) &&
        compare(widthRem, match[4], toRem(match[5], match[6]))
      );
    match = new RegExp(`^\\(\\s*${feature}\\s*(<=|<|>=|>|=)\\s*${length}\\s*\\)$`).exec(text);
    if (match) return compare(widthRem, match[1], toRem(match[2], match[3]));
    match = new RegExp(`^\\(\\s*${length}\\s*(<=|<|>=|>|=)\\s*${feature}\\s*\\)$`).exec(text);
    if (match) return compare(widthRem, flip[match[3]], toRem(match[1], match[2]));
    match = new RegExp(`^\\(\\s*(min|max)-${feature}\\s*:\\s*${length}\\s*\\)$`).exec(text);
    if (match)
      return match[1] === 'min'
        ? widthRem >= toRem(match[2], match[3])
        : widthRem <= toRem(match[2], match[3]);
    return null;
  };
  let unknown = false;
  for (const alternative of condition.split(/\s+or\s+/)) {
    const results = alternative.split(/\s+and\s+/).map(test);
    if (results.includes(false)) continue;
    if (results.includes(null)) {
      unknown = true;
      continue;
    }
    return true;
  }
  return unknown ? null : false;
}

function countStyleRules(rule: RuleLike): number {
  const nested = rule.cssRules
    ? Array.from(rule.cssRules).reduce((sum, inner) => sum + countStyleRules(inner), 0)
    : 0;
  return (typeof rule.selectorText === 'string' ? 1 : 0) + nested;
}

function conditionWithoutContainerName(rule: RuleLike): string {
  if (rule.containerQuery) return rule.containerQuery;
  const text = rule.conditionText ?? '';
  return rule.containerName ? text.replace(/^\s*\S+\s+(?=\(|not\b)/, '') : text;
}

/** @internal */
export function readContainerQueries(
  sheets: Iterable<{ cssRules: ArrayLike<RuleLike> }>,
  rootPx: number,
): Map<string, ContainerQuery[]> {
  const byName = new Map<string, ContainerQuery[]>();
  const visit = (rules: ArrayLike<RuleLike>) => {
    for (const rule of Array.from(rules)) {
      if (isContainerRule(rule)) {
        const container = rule.containerName ?? '';
        const condition = conditionWithoutContainerName(rule);
        const list = byName.get(container) ?? [];
        byName.set(container, list);
        const count = Array.from(rule.cssRules ?? []).reduce(
          (sum, inner) => sum + countStyleRules(inner),
          0,
        );
        const same = list.find((query) => query.condition === condition);
        if (same) same.rules += count;
        else
          list.push({
            container,
            condition,
            rules: count,
            thresholds: thresholdsOf(condition, rootPx),
          });
      }
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  for (const sheet of sheets) {
    const rules = cssRulesUnlessCrossOrigin(sheet);
    if (rules) visit(rules);
  }
  return byName;
}

export function queriesFor(
  containerName: string,
  queries: Map<string, ContainerQuery[]>,
): ContainerQuery[] {
  const names = containerName.split(/\s+/).filter((name) => name && name !== 'none');
  const queriesOfTheNearestContainer = queries.get('') ?? [];
  return names.length
    ? names.flatMap((name) => queries.get(name) ?? [])
    : queriesOfTheNearestContainer;
}

export const thresholdsFor = (queries: ContainerQuery[]) =>
  [...new Set(queries.flatMap((query) => query.thresholds))].sort((a, b) => a - b);

let cachedUntilSheetsChange: {
  key: string;
  rootPx: number;
  queries: Map<string, ContainerQuery[]>;
} | null = null;

export function cssRulesUnlessCrossOrigin<Rules>(sheet: {
  readonly cssRules: Rules;
}): Rules | null {
  try {
    return sheet.cssRules;
  } catch {
    return null;
  }
}

export function styleSheetsVersion(sheets: readonly CSSStyleSheet[]): string {
  return sheets
    .map((sheet) => {
      const rules = cssRulesUnlessCrossOrigin(sheet);
      return rules ? `${sheet.href ?? 'inline'}:${rules.length}` : 'foreign';
    })
    .join('|');
}

export function pageContainerQueries(rootPx: number): Map<string, ContainerQuery[]> {
  const sheets = Array.from(document.styleSheets);
  const key = styleSheetsVersion(sheets);
  if (cachedUntilSheetsChange?.key !== key || cachedUntilSheetsChange.rootPx !== rootPx)
    cachedUntilSheetsChange = {
      key,
      rootPx,
      queries: readContainerQueries(
        sheets as unknown as { cssRules: ArrayLike<RuleLike> }[],
        rootPx,
      ),
    };
  return cachedUntilSheetsChange.queries;
}
