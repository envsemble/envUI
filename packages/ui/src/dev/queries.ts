// Container queries, read from the page's style sheets: which `@container` rules ask about a
// container, the widths they test and whether each holds at a width.

/** One condition of `@container` rules, with every rule that asks it about one container name. */
export interface ContainerQuery {
  /** The container name the rules ask about; empty for the nearest container of any name. */
  container: string;
  /** The condition, such as `(inline-size >= 37.5rem)`. */
  condition: string;
  /** The style rules inside rules with this condition. */
  rules: number;
  /** The widths the condition tests, in rem. */
  thresholds: number[];
}

/** The shape of the CSSOM rules read here, so that tests can hand in plain objects. */
interface RuleLike {
  cssRules?: ArrayLike<RuleLike>;
  selectorText?: string;
  containerName?: string;
  containerQuery?: string;
  conditionText?: string;
}

const isContainerRule = (rule: RuleLike) =>
  typeof rule.containerName === 'string' && typeof rule.conditionText === 'string';

/** The widths a condition tests, in rem: `(width >= 600px)` at a 16 px root is 37.5. */
export function thresholdsOf(condition: string, rootPx: number): number[] {
  const widths = new Set<number>();
  for (const match of condition.matchAll(/(\d*\.?\d+)(rem|em|px)\b/g)) {
    const value = Number(match[1]);
    widths.add(Math.round((match[2] === 'px' ? value / rootPx : value) * 100) / 100);
  }
  return [...widths].sort((a, b) => a - b);
}

/**
 * Whether a width condition holds at a width in rem; null when it can't tell, such as for a
 * height or a style query. It reads ranges (`inline-size >= 40rem`, `30rem < width <= 50rem`),
 * min-width and max-width, joined by `and` or `or`, and `not`.
 */
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

/** The condition of a container rule without its container name. */
function conditionOf(rule: RuleLike): string {
  if (rule.containerQuery) return rule.containerQuery;
  const text = rule.conditionText ?? '';
  return rule.containerName ? text.replace(/^\s*\S+\s+(?=\(|not\b)/, '') : text;
}

/**
 * Every `@container` rule in the style sheets, by the container name it asks about, with its
 * conditions merged: one entry per name and condition, counting the style rules inside.
 */
export function readContainerQueries(
  sheets: Iterable<{ cssRules: ArrayLike<RuleLike> }>,
  rootPx: number,
): Map<string, ContainerQuery[]> {
  const byName = new Map<string, ContainerQuery[]>();
  const visit = (rules: ArrayLike<RuleLike>) => {
    for (const rule of Array.from(rules)) {
      if (isContainerRule(rule)) {
        const container = rule.containerName ?? '';
        const condition = conditionOf(rule);
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
    let rules: ArrayLike<RuleLike>;
    try {
      rules = sheet.cssRules;
    } catch {
      // A style sheet from another origin can't be read, and holds none of the page's own rules.
      continue;
    }
    visit(rules);
  }
  return byName;
}

/**
 * The queries a container answers: those naming any of its names. A container without a name
 * answers the queries that name none; those ask whichever container is nearest the element they
 * style, so a named container is not credited with them.
 */
export function queriesFor(
  containerName: string,
  queries: Map<string, ContainerQuery[]>,
): ContainerQuery[] {
  const names = containerName.split(/\s+/).filter((name) => name && name !== 'none');
  return names.length ? names.flatMap((name) => queries.get(name) ?? []) : (queries.get('') ?? []);
}

/** The widths a container's queries test, in rem, smallest first. */
export const thresholdsFor = (queries: ContainerQuery[]) =>
  [...new Set(queries.flatMap((query) => query.thresholds))].sort((a, b) => a - b);

let cached: { key: string; rootPx: number; queries: Map<string, ContainerQuery[]> } | null = null;

/**
 * The page's container queries, read again only when its style sheets change: another sheet, or
 * another number of rules in one.
 */
export function pageContainerQueries(rootPx: number): Map<string, ContainerQuery[]> {
  const sheets = Array.from(document.styleSheets);
  const key = sheets
    .map((sheet) => {
      try {
        return `${sheet.href ?? 'inline'}:${sheet.cssRules.length}`;
      } catch {
        return 'foreign';
      }
    })
    .join('|');
  if (cached?.key !== key || cached.rootPx !== rootPx)
    cached = {
      key,
      rootPx,
      queries: readContainerQueries(
        sheets as unknown as { cssRules: ArrayLike<RuleLike> }[],
        rootPx,
      ),
    };
  return cached.queries;
}
