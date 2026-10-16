/**
 * The contrast gate's record of what it requires: tests/contrast/DeclaredPairs.json holds every
 * declared pair with its kind and its minimum at each contrast it is measured in, and the names of
 * the dropped, renamed and relaxed pairs. Against it the gate fails on a pair that disappears
 * unexplained, and on one that is held to less than before, by a weaker kind, a lower minimum or a
 * contrast it is no longer measured in, unless `relaxed` in Pairs.ts lists that change with its
 * rationale. Entries of `dropped`, `renamed` and `relaxed` stay once recorded, so the reasons can't
 * be removed after the snapshot is updated either.
 */
import type { ContrastKind, ContrastPair, Relaxation, Requirement } from './Pairs';
import type { ContrastTheme } from './Themes';
import { isDistance } from './Contrast';

export const declaredFile = 'tests/contrast/DeclaredPairs.json';

export interface DeclaredPairs {
  $comment?: string;
  /** Every declared pair by name, with what it is held to. */
  pairs: Record<string, Requirement>;
  /** The names in `dropped`. */
  dropped: string[];
  /** The old names in `renamed`. */
  renamed: string[];
  /** The changes `relaxed` accepts, without their rationale. */
  relaxed: Omit<Relaxation, 'rationale'>[];
}

/** How much a kind asks, from least to most: a kind lower down is a weaker requirement. */
const strength: Readonly<Record<ContrastKind, number>> = {
  difference: 0,
  distinct: 1,
  'non-text': 2,
  focus: 2,
  text: 3,
};

const levels = ['standard', 'high'] as const;

/** The minimum a pair is held to in a theme: its own lowered one for the theme's contrast, if any. */
export function minimumOf(pair: ContrastPair, theme: ContrastTheme) {
  return pair.minimum?.[theme.contrast] ?? theme.minimums[pair.kind];
}

/** What a pair is held to: its kind, and its minimum at each contrast it is measured in. */
export function requirementOf(pair: ContrastPair, themes: readonly ContrastTheme[]): Requirement {
  const minimum: Requirement['minimum'] = {};
  for (const level of levels) {
    const theme = themes.find((candidate) => candidate.contrast === level);
    if (theme && (!pair.contrast || pair.contrast === level))
      minimum[level] = minimumOf(pair, theme);
  }
  return { kind: pair.kind, minimum };
}

const describe = ({ kind, minimum }: Requirement) =>
  `${kind} ${levels
    .filter((level) => minimum[level] !== undefined)
    .map((level) => `${minimum[level]} at ${level} contrast`)
    .join(', ')}`;

const sameRequirement = (a: Requirement, b: Requirement) =>
  a.kind === b.kind && levels.every((level) => a.minimum[level] === b.minimum[level]);

/** How `current` asks less than `recorded`, one line per way; empty when it asks as much or more. */
export function loosening(current: Requirement, recorded: Requirement): string[] {
  const ways: string[] = [];
  if (strength[current.kind] < strength[recorded.kind])
    ways.push(`its kind went from ${recorded.kind} to the weaker ${current.kind}`);
  // Ratios and ΔEOK distances can't be compared; a stronger kind of the other measure asks more.
  const comparable = isDistance(current.kind) === isDistance(recorded.kind);
  for (const level of levels) {
    const before = recorded.minimum[level];
    const after = current.minimum[level];
    if (before === undefined) continue;
    if (after === undefined) ways.push(`it is no longer measured at ${level} contrast`);
    else if (comparable && after < before)
      ways.push(`its ${level} minimum went from ${before} to ${after}`);
  }
  return ways;
}

export interface SnapshotInput {
  pairs: readonly ContrastPair[];
  dropped: readonly { pair: string }[];
  renamed: readonly { from: string }[];
  relaxed: readonly Relaxation[];
  themes: readonly ContrastTheme[];
  pairName: (pair: ContrastPair) => string;
  /** The parsed DeclaredPairs.json, or undefined when the file is missing. */
  recorded: DeclaredPairs | undefined;
  /** Whether the run updates snapshots (--update-snapshots). */
  update: boolean;
  /** Whether the run is in CI, where a missing snapshot is never written. */
  ci: boolean;
}

/**
 * Checks the declared pairs against the recorded snapshot. Returns the problems, and the snapshot
 * to write when the run updates snapshots and nothing is wrong.
 */
export function checkSnapshot(input: SnapshotInput): {
  problems: string[];
  write?: DeclaredPairs;
} {
  const { recorded, update, ci } = input;
  const problems: string[] = [];
  const current: DeclaredPairs = {
    pairs: Object.fromEntries(
      input.pairs
        .map((pair) => [input.pairName(pair), requirementOf(pair, input.themes)] as const)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    ),
    dropped: input.dropped.map((entry) => entry.pair).sort(),
    renamed: input.renamed.map((entry) => entry.from).sort(),
    relaxed: input.relaxed.map(({ pair, kind, minimum }) => ({
      pair,
      kind,
      minimum: Object.fromEntries(
        levels
          .filter((level) => minimum[level] !== undefined)
          .map((level) => [level, minimum[level]]),
      ),
    })),
  };

  for (const entry of input.relaxed) {
    if (!entry.rationale.trim())
      problems.push(`The relaxation of ${entry.pair} needs a rationale.`);
    if (
      !current.pairs[entry.pair] &&
      !current.dropped.includes(entry.pair) &&
      !current.renamed.includes(entry.pair)
    )
      problems.push(
        `relaxed in tests/contrast/Pairs.ts lists ${entry.pair}, which is neither declared, dropped nor renamed.`,
      );
  }

  if (!recorded) {
    if (ci)
      problems.push(
        `${declaredFile} is missing: restore it from the repository. CI never writes it, since a snapshot written from today's pairs would accept any weakening.`,
      );
    else if (!update)
      problems.push(
        `${declaredFile} is missing: restore it from the repository, or, for a new registry, record it with npm run test:contrast -- --update-snapshots.`,
      );
    return { problems, write: problems.length === 0 ? current : undefined };
  }

  const declared = new Set(Object.keys(current.pairs));
  const accounted = new Set([...current.dropped, ...current.renamed]);

  // Every name declared when the snapshot was taken is still declared, dropped or renamed.
  for (const name of Object.keys(recorded.pairs))
    if (!declared.has(name) && !accounted.has(name))
      problems.push(
        `${name} was declared (${declaredFile}) and is gone from tests/contrast/Pairs.ts: list it in dropped or renamed there, with the reason.`,
      );

  // No pair is held to less than it was, unless `relaxed` lists the change.
  for (const [name, requirement] of Object.entries(current.pairs)) {
    const before = recorded.pairs[name];
    if (!before) continue;
    const ways = loosening(requirement, before);
    if (ways.length === 0) continue;
    const accepted = input.relaxed.some(
      (entry) => entry.pair === name && sameRequirement(entry, requirement),
    );
    if (!accepted)
      problems.push(
        `${name} is held to less than ${declaredFile} records: ${ways.join('; ')}. Restore it, or, for a deliberate relaxation, list it in relaxed in tests/contrast/Pairs.ts with its rationale: ${JSON.stringify({ pair: name, ...requirement, rationale: '…' })}`,
      );
  }

  // Recorded reasons stay: a dropped or renamed pair until it is declared again, a relaxation always.
  for (const name of recorded.dropped)
    if (!current.dropped.includes(name) && !declared.has(name))
      problems.push(
        `${name} is recorded as dropped (${declaredFile}) but no longer listed in dropped in tests/contrast/Pairs.ts: keep its entry and reason.`,
      );
  for (const name of recorded.renamed)
    if (!current.renamed.includes(name) && !declared.has(name))
      problems.push(
        `${name} is recorded as renamed (${declaredFile}) but no longer listed in renamed in tests/contrast/Pairs.ts: keep its entry and reason.`,
      );
  for (const entry of recorded.relaxed)
    if (
      !current.relaxed.some((other) => other.pair === entry.pair && sameRequirement(other, entry))
    )
      problems.push(
        `The relaxation of ${entry.pair} to ${describe(entry)} is recorded (${declaredFile}) but no longer listed in relaxed in tests/contrast/Pairs.ts: keep its entry and rationale.`,
      );

  if (problems.length > 0) return { problems };
  if (update) return { problems, write: current };
  if (JSON.stringify(stripComment(recorded)) !== JSON.stringify(current)) {
    const changed = [
      ...Object.keys(current.pairs).filter(
        (name) =>
          !recorded.pairs[name] || !sameRequirement(recorded.pairs[name], current.pairs[name]),
      ),
      ...current.dropped.filter((name) => !recorded.dropped.includes(name)),
      ...current.renamed.filter((name) => !recorded.renamed.includes(name)),
    ];
    problems.push(
      `${declaredFile} is out of date${changed.length > 0 ? `, such as for ${changed[0]}` : ''}: run npm run test:contrast -- --update-snapshots.`,
    );
  }
  return { problems };
}

function stripComment({ pairs, dropped, renamed, relaxed }: DeclaredPairs): DeclaredPairs {
  return { pairs, dropped, renamed, relaxed };
}

/** The file's text for a snapshot. */
export function formatSnapshot(snapshot: DeclaredPairs): string {
  return `${JSON.stringify(
    {
      $comment:
        'What the contrast gate requires of each pair in tests/contrast/Pairs.ts, and the names of the dropped, renamed and relaxed pairs. Written by npm run test:contrast -- --update-snapshots; see tests/contrast/Snapshot.ts.',
      ...stripComment(snapshot),
    },
    null,
    2,
  )}\n`;
}
