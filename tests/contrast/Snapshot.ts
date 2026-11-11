/**
 * The contrast gate's record of what it requires: tests/contrast/DeclaredPairs.json holds every
 * declared pair with its kind and its minimum at each contrast it is measured in, and the names of
 * the dropped, renamed and relaxed pairs. Against it the gate fails on a pair that disappears
 * unexplained, and on one that is held to less than before, by a weaker kind, a switch between a
 * ΔEOK distance and a ratio, a lower minimum or a contrast it is no longer measured in, unless a new
 * entry of `relaxed` in PairHistory.ts lists that change with its rationale. A renamed pair is held to
 * what its old name recorded, as well as to its own record when it takes a name already recorded,
 * and through a chain of renames. Each `relaxed` entry approves one loosening: once recorded it is
 * spent, so loosening the pair the same way again later needs another entry. Entries of `dropped`,
 * `renamed` and `relaxed` stay once recorded, so the reasons can't be removed after the snapshot is
 * updated either. The pairs are also compared with the base branch's copy of the file
 * (readBaseSnapshot), which a branch can't edit along with Pairs.ts.
 *
 * A relaxation the branch recorded but its base doesn't yet can be undone: restore the pair, delete
 * its `relaxed` entry, restore the snapshot with `git checkout <base> -- tests/contrast/DeclaredPairs.json`
 * and record the branch's other changes again with `npm run test:contrast -- --update-snapshots`.
 * Once the base records it, it stays, and the pair is tightened again in Pairs.ts alone.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import type { ContrastKind, ContrastPair, Relaxation, Requirement } from './Pairs.ts';
import type { ContrastTheme } from './Themes.ts';
import { isDistance } from './Contrast.ts';

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
  /**
   * Names declared when the snapshot was taken whose requirements it doesn't record. Only a base's
   * snapshot in the first format, which listed the declared pairs by name alone, has them: they
   * must still be declared, dropped or renamed, and hold their pairs to nothing more.
   */
  unrecorded?: string[];
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
function requirementOf(pair: ContrastPair, themes: readonly ContrastTheme[]): Requirement {
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

/** Every old name renamed into `name`, directly or through other renamed names. */
function renamedInto(name: string, renamed: readonly { from: string; to: string }[]) {
  const names = new Set<string>();
  const queue = [name];
  for (let next = queue.shift(); next !== undefined; next = queue.shift())
    for (const entry of renamed)
      if (entry.to === next && entry.from !== name && !names.has(entry.from)) {
        names.add(entry.from);
        queue.push(entry.from);
      }
  return [...names];
}

const measure = (kind: ContrastKind) => (isDistance(kind) ? 'a ΔEOK distance' : 'a ratio');

/** How `current` asks less than `recorded`, one line per way; empty when it asks as much or more. */
function loosening(current: Requirement, recorded: Requirement): string[] {
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

/**
 * Where each renamed pair went: its new name must be declared, or be dropped or renamed onward in
 * turn, so a pair that was once a rename's target can leave the registry too.
 */
export function checkRenameTargets(
  renamed: readonly { from: string; to: string }[],
  declared: ReadonlySet<string>,
  dropped: readonly { pair: string }[],
): string[] {
  const problems: string[] = [];
  for (const entry of renamed) {
    const seen = new Set([entry.from]);
    let target = entry.to;
    while (!declared.has(target) && !dropped.some((other) => other.pair === target)) {
      const onward = renamed.find((other) => other.from === target);
      if (!onward || seen.has(target)) {
        problems.push(
          `${entry.from} is listed as renamed to ${entry.to}, which tests/contrast/Pairs.ts doesn't declare and tests/contrast/PairHistory.ts doesn't drop or rename onward to a declared or dropped pair.`,
        );
        break;
      }
      seen.add(target);
      target = onward.to;
    }
  }
  return problems;
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
  /**
   * The snapshot on the base branch, as readBaseSnapshot reads it: the declared pairs are compared
   * with it too, and a loosening since needs a relaxation new since.
   */
  base?: BaseSnapshot;
}

export interface BaseSnapshot {
  /** Where it was read, for messages. */
  label: string;
  recorded: DeclaredPairs;
}

/**
 * Checks the declared pairs against the recorded snapshot. Returns the problems, and the snapshot
 * to write when the run updates snapshots and nothing is wrong.
 */
export function checkSnapshot(input: SnapshotInput): {
  problems: string[];
  write?: DeclaredPairs;
} {
  const { recorded, update, ci, base } = input;
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
        `relaxed in tests/contrast/PairHistory.ts lists ${entry.pair}, which is neither declared, dropped nor renamed.`,
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
    // A snapshot written afresh holds every pair to what it asks today, so it is compared with the
    // base first: deleting the file can't record a weakening the base would catch.
    const compared = base && compare(current, base.recorded, input.renamed, base.label);
    if (compared) problems.push(...compared.problems);
    // Nor can it record a relaxation that relaxed nothing, which it would count as spent. An entry
    // is spent when the base records it or it approves a loosening since; without a base, nothing
    // records what any entry relaxed.
    problems.push(
      ...(compared
        ? relaxingNothing(current, compared.unspent, relaxesNothing(base.label))
        : relaxingNothing(
            current,
            countRelaxations(current.relaxed),
            `, and neither ${declaredFile} nor a base branch's copy records what it relaxed: restore ${declaredFile} from the repository, or remove the entry.`,
          )),
    );
    return { problems, write: problems.length === 0 ? current : undefined };
  }

  const own = compare(current, recorded, input.renamed, declaredFile);
  problems.push(
    ...own.problems,
    ...relaxingNothing(current, own.unspent, relaxesNothing(declaredFile)),
  );
  // Against the base branch's snapshot too, so that a snapshot edited by hand along with Pairs.ts,
  // or a recorded relaxation deleted from both, can't weaken a pair unnoticed. An entry recorded on
  // the branch may since have been spent and tightened back, so one the base doesn't record and
  // that approves no loosening since the base is no problem.
  if (problems.length === 0 && base)
    problems.push(...compare(current, base.recorded, input.renamed, base.label).problems);

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

/**
 * Compares the declared pairs, `current`, with a recorded snapshot, read from `source`: names gone
 * unexplained, pairs held to less without a relaxation new since the record, and recorded reasons
 * removed. Also returns how many entries of each relaxation are new since the record and approved
 * no loosening, for relaxingNothing.
 */
function compare(
  current: DeclaredPairs,
  recorded: DeclaredPairs,
  renamed: readonly { from: string; to: string }[],
  source: string,
): { problems: string[]; unspent: Map<string, number> } {
  const problems: string[] = [];
  const declared = new Set(Object.keys(current.pairs));
  const accounted = new Set([...current.dropped, ...current.renamed]);

  // Every name declared when the snapshot was taken is still declared, dropped or renamed.
  for (const name of [...Object.keys(recorded.pairs), ...(recorded.unrecorded ?? [])])
    if (!declared.has(name) && !accounted.has(name))
      problems.push(
        `${name} was declared (${source}) and is gone from tests/contrast/Pairs.ts: list it in dropped or renamed in tests/contrast/PairHistory.ts, with the reason.`,
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
    // Its own record, and the record of every name renamed into it, directly or through a chain of
    // renames, that the snapshot still holds: a pair renamed onto a name already recorded keeps
    // what it asked too.
    const baselines = [name, ...renamedInto(name, renamed)]
      .filter((from) => recorded.pairs[from])
      .map((from) => ({ from, before: recorded.pairs[from] }));
    const loosened = baselines
      .map(({ from, before }) => ({ from, ways: loosening(requirement, before) }))
      .filter(({ ways }) => ways.length > 0);
    if (loosened.length === 0 || spend(relaxationKey({ pair: name, ...requirement }))) continue;
    for (const { from, ways } of loosened) {
      const renamedFrom = from === name ? '' : `, renamed from ${from},`;
      const recordedFor = from === name ? '' : ` for ${from}`;
      problems.push(
        `${name}${renamedFrom} is held to less than ${source} records${recordedFor}: ${ways.join('; ')}. Restore it, or, for a deliberate relaxation, add an entry to relaxed in tests/contrast/PairHistory.ts with its rationale: ${JSON.stringify({ pair: name, ...requirement, rationale: '…' })}`,
      );
    }
  }

  // Recorded reasons stay: a dropped or renamed pair until it is declared again, a relaxation always.
  for (const name of recorded.dropped)
    if (!current.dropped.includes(name) && !declared.has(name))
      problems.push(
        `${name} is recorded as dropped (${source}) but no longer listed in dropped in tests/contrast/PairHistory.ts: keep its entry and reason.`,
      );
  for (const name of recorded.renamed)
    if (!current.renamed.includes(name) && !declared.has(name))
      problems.push(
        `${name} is recorded as renamed (${source}) but no longer listed in renamed in tests/contrast/PairHistory.ts: keep its entry and reason.`,
      );
  for (const [key, count] of countRelaxations(recorded.relaxed))
    if ((countRelaxations(current.relaxed).get(key) ?? 0) < count) {
      const entry = recorded.relaxed.find((other) => relaxationKey(other) === key)!;
      problems.push(
        `The relaxation of ${entry.pair} to ${describe(entry)} is recorded${count > 1 ? ` ${count} times` : ''} (${source}) but no longer listed${count > 1 ? ' as often' : ''} in relaxed in tests/contrast/PairHistory.ts: keep its entry and rationale.`,
      );
    }
  return { problems, unspent };
}

const relaxesNothing = (source: string) =>
  `, which relaxes nothing ${source} records: remove the entry, or list exactly what the pair is held to now, when that is less than recorded.`;

/**
 * The new relaxations that relaxed nothing, each a problem ending with `why`: `unspent` counts, for
 * each relaxation, its entries new since the record that approved no loosening. A new entry is
 * spent on a loosening now, so it can't be recorded ahead of one and used later.
 */
function relaxingNothing(
  current: DeclaredPairs,
  unspent: ReadonlyMap<string, number>,
  why: string,
): string[] {
  const left = new Map(unspent);
  const problems: string[] = [];
  for (const entry of current.relaxed) {
    const key = relaxationKey(entry);
    const count = left.get(key) ?? 0;
    if (count <= 0) continue;
    left.set(key, count - 1);
    problems.push(
      `relaxed in tests/contrast/PairHistory.ts lists ${entry.pair} at ${describe(entry)}${why}`,
    );
  }
  return problems;
}

function stripComment({ pairs, dropped, renamed, relaxed }: DeclaredPairs): DeclaredPairs {
  return { pairs, dropped, renamed, relaxed };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Reads a snapshot's text, from `source`. A snapshot from before `dropped`, `renamed` or `relaxed`
 * were recorded lists none, and one in the first format, whose `pairs` listed the declared pairs by
 * name alone, records no requirements: its names are `unrecorded`. Anything else that isn't a
 * snapshot is a problem.
 */
function parseSnapshot(
  text: string,
  source: string,
): { recorded: DeclaredPairs; problem?: undefined } | { recorded?: undefined; problem: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { problem: `${source} isn't valid JSON: ${(error as Error).message}` };
  }
  const names =
    isObject(data) &&
    Array.isArray(data.pairs) &&
    data.pairs.every((name) => typeof name === 'string')
      ? (data.pairs as string[])
      : undefined;
  if (!isObject(data) || (!isObject(data.pairs) && !names))
    return {
      problem: `${source} has no pairs object, so it isn't a snapshot the contrast gate reads.`,
    };
  const lists = {
    dropped: data.dropped ?? [],
    renamed: data.renamed ?? [],
    relaxed: data.relaxed ?? [],
  };
  for (const [key, list] of Object.entries(lists))
    if (!Array.isArray(list))
      return {
        problem: `${source} has a ${key} that isn't a list, so it isn't a snapshot the contrast gate reads.`,
      };
  if (names) return { recorded: { pairs: {}, ...lists, unrecorded: names } as DeclaredPairs };
  return { recorded: { ...data, pairs: data.pairs, ...lists } as DeclaredPairs };
}

/** The working tree's snapshot: undefined when the file is missing. */
export function readSnapshot(file = declaredFile) {
  return existsSync(file)
    ? parseSnapshot(readFileSync(file, 'utf8'), file)
    : { recorded: undefined };
}

/** Runs git with these arguments and returns its trimmed output; throws when git fails. */
export type Git = (...args: string[]) => string;

const runGit: Git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** The branch a branch merges into, whose merge-base with HEAD is the base when ENVUI_CONTRAST_BASE is unset. */
const baseBranch = 'origin/dev';

/**
 * The snapshot on the base: at ENVUI_CONTRAST_BASE, any revision git knows, or else at the
 * merge-base of HEAD with baseBranch, unless that is the branch's own copy: the branch it tracks or
 * its namesake on origin, which hold its edits. It reads only what the clone already has, never
 * fetching. Without git, the base branch or the file at its merge-base, it returns a note instead,
 * and the gate compares with the working tree's snapshot alone; a base that was asked for and
 * can't be read, or lacks the file, is a problem.
 */
export function readBaseSnapshot({
  requested = process.env.ENVUI_CONTRAST_BASE,
  git = runGit,
}: { requested?: string; git?: Git } = {}): {
  base?: BaseSnapshot;
  note?: string;
  problem?: string;
} {
  const attempt = <T>(read: () => T) => {
    try {
      return read();
    } catch {
      return undefined;
    }
  };
  const show = (commit: string) => attempt(() => git('show', `${commit}:${declaredFile}`));
  const read = (text: string, label: string, note?: string) => {
    const parsed = parseSnapshot(text, label);
    return parsed.problem !== undefined
      ? { problem: parsed.problem }
      : { base: { label, recorded: parsed.recorded }, note };
  };
  if (requested) {
    const commit = attempt(() => git('rev-parse', '--verify', `${requested}^{commit}`));
    if (commit === undefined)
      return {
        problem: `ENVUI_CONTRAST_BASE is ${requested}, which git can't find in this clone.`,
      };
    const text = show(commit);
    if (text === undefined)
      return {
        problem: `ENVUI_CONTRAST_BASE is ${requested}, where ${declaredFile} doesn't exist: set it to a revision that has the snapshot, or unset it to compare with the base branch's.`,
      };
    return read(text, `${declaredFile} at ${requested} (ENVUI_CONTRAST_BASE)`);
  }

  const unbased = `${declaredFile} is not compared with a base branch's copy. Set ENVUI_CONTRAST_BASE to a revision that has it, such as the branch this one merges into.`;
  // The branch's own copies hold its edits, so neither is a base: the branch it tracks, however it
  // is named, and its namesake on origin.
  const branch = attempt(() => git('symbolic-ref', '--quiet', '--short', 'HEAD'));
  const upstream =
    branch &&
    attempt(() => git('for-each-ref', '--format=%(upstream:short)', `refs/heads/${branch}`));
  if (branch && (`origin/${branch}` === baseBranch || upstream === baseBranch))
    return { note: `Skipping ${baseBranch}, this branch's own copy. ${unbased}` };
  const commit = attempt(() => git('merge-base', 'HEAD', baseBranch));
  if (commit === undefined)
    return { note: `No merge-base with ${baseBranch} in this clone. ${unbased}` };
  const short = commit.slice(0, 8);
  const text = show(commit);
  if (text === undefined)
    return {
      note: `${declaredFile} doesn't exist at the merge-base with ${baseBranch} (${short}). ${unbased}`,
    };
  return read(
    text,
    `${declaredFile} at ${short}, the merge-base with ${baseBranch}`,
    `Comparing ${declaredFile} with its copy at ${short} (the merge-base with ${baseBranch}). Set ENVUI_CONTRAST_BASE to compare with another revision.`,
  );
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
