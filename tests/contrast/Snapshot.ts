/**
 * The contrast gate's record of what it requires: tests/contrast/DeclaredPairs.json holds every
 * declared pair with its kind and its minimum at each contrast it is measured in, and the names of
 * the dropped, renamed and relaxed pairs. Against it the gate fails on a pair that disappears
 * unexplained, and on one that is held to less than before, by a weaker kind, a switch between a
 * ΔEOK distance and a ratio, a lower minimum or a contrast it is no longer measured in, unless a new
 * entry of `relaxed` in Pairs.ts lists that change with its rationale. A renamed pair is held to
 * what its old name recorded. Each `relaxed` entry approves one loosening: once recorded it is
 * spent, so loosening the pair the same way again later needs another entry. Entries of `dropped`,
 * `renamed` and `relaxed` stay once recorded, so the reasons can't be removed after the snapshot is
 * updated either.
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
  /** The changes `relaxed` accepted, without their rationale; each is spent once recorded. */
  relaxed: Omit<Relaxation, 'rationale'>[];
}

/**
 * How much a kind asks, from least to most: a kind lower down is a weaker requirement. Only kinds of
 * one measure compare; a switch between a ΔEOK distance and a ratio is a loosening of its own.
 */
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

/** A relaxation's identity: its pair and the requirement it accepts, without the rationale. */
const relaxationKey = ({ pair, kind, minimum }: Omit<Relaxation, 'rationale'>) =>
  JSON.stringify([pair, kind, ...levels.map((level) => minimum[level] ?? null)]);

/** How many times each relaxation is listed. */
function countRelaxations(entries: readonly Omit<Relaxation, 'rationale'>[]) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = relaxationKey(entry);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

const measure = (kind: ContrastKind) => (isDistance(kind) ? 'a ΔEOK distance' : 'a ratio');

/** How `current` asks less than `recorded`, one line per way; empty when it asks as much or more. */
export function loosening(current: Requirement, recorded: Requirement): string[] {
  const ways: string[] = [];
  // Ratios and ΔEOK distances can't be compared, so a switch between them, either way and to any
  // kind, asks less: a ratio of 1.01 or a distance of 0.0001 would pass for the stronger kind.
  const comparable = isDistance(current.kind) === isDistance(recorded.kind);
  if (!comparable)
    ways.push(
      `its kind went from ${recorded.kind}, ${measure(recorded.kind)}, to ${current.kind}, ${measure(current.kind)}, which can't be compared`,
    );
  else if (strength[current.kind] < strength[recorded.kind])
    ways.push(`its kind went from ${recorded.kind} to the weaker ${current.kind}`);
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
  renamed: readonly { from: string; to: string }[];
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

  // No pair is held to less than it was, under its name or the one it was renamed from, unless a
  // relaxation not yet recorded lists the change. Each relaxation approves one loosening.
  const unspent = countRelaxations(current.relaxed);
  for (const [key, count] of countRelaxations(recorded.relaxed))
    unspent.set(key, (unspent.get(key) ?? 0) - count);
  const spend = (key: string) => {
    const left = unspent.get(key) ?? 0;
    if (left > 0) unspent.set(key, left - 1);
    return left > 0;
  };
  for (const [name, requirement] of Object.entries(current.pairs)) {
    const baselines = recorded.pairs[name]
      ? [{ from: name, before: recorded.pairs[name] }]
      : input.renamed
          .filter((entry) => entry.to === name && recorded.pairs[entry.from])
          .map((entry) => ({ from: entry.from, before: recorded.pairs[entry.from] }));
    const loosened = baselines
      .map(({ from, before }) => ({ from, ways: loosening(requirement, before) }))
      .filter(({ ways }) => ways.length > 0);
    if (loosened.length === 0 || spend(relaxationKey({ pair: name, ...requirement }))) continue;
    for (const { from, ways } of loosened) {
      const renamedFrom = from === name ? '' : `, renamed from ${from},`;
      const recordedFor = from === name ? '' : ` for ${from}`;
      problems.push(
        `${name}${renamedFrom} is held to less than ${declaredFile} records${recordedFor}: ${ways.join('; ')}. Restore it, or, for a deliberate relaxation, add an entry to relaxed in tests/contrast/Pairs.ts with its rationale: ${JSON.stringify({ pair: name, ...requirement, rationale: '…' })}`,
      );
    }
  }
  // A new relaxation is spent on a loosening now, so it can't be recorded ahead of one and used later.
  for (const entry of current.relaxed)
    if (spend(relaxationKey(entry)))
      problems.push(
        `relaxed in tests/contrast/Pairs.ts lists ${entry.pair} at ${describe(entry)}, which relaxes nothing ${declaredFile} records: remove the entry, or list exactly what the pair is held to now, when that is less than recorded.`,
      );

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
  for (const [key, count] of countRelaxations(recorded.relaxed))
    if ((countRelaxations(current.relaxed).get(key) ?? 0) < count) {
      const entry = recorded.relaxed.find((other) => relaxationKey(other) === key)!;
      problems.push(
        `The relaxation of ${entry.pair} to ${describe(entry)} is recorded${count > 1 ? ` ${count} times` : ''} (${declaredFile}) but no longer listed${count > 1 ? ' as often' : ''} in relaxed in tests/contrast/Pairs.ts: keep its entry and rationale.`,
      );
    }

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
