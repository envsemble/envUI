import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import type { ContrastKind, ContrastPair, Relaxation, Requirement } from './Pairs.ts';
import type { ContrastTheme } from './Themes.ts';
import { isDistance } from './Contrast.ts';

export const declaredFile = 'tests/contrast/DeclaredPairs.json';

export interface DeclaredPairs {
  $comment?: string;
  pairs: Record<string, Requirement>;
  dropped: string[];
  renamed: string[];
  relaxed: Omit<Relaxation, 'rationale'>[];
  unrecorded?: string[];
}

const strength: Readonly<Record<ContrastKind, number>> = {
  difference: 0,
  distinct: 1,
  'non-text': 2,
  focus: 2,
  text: 3,
};

const levels = ['standard', 'high'] as const;

export function minimumOf(pair: ContrastPair, theme: ContrastTheme) {
  return pair.minimum?.[theme.contrast] ?? theme.minimums[pair.kind];
}

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

const relaxationKey = ({ pair, kind, minimum }: Omit<Relaxation, 'rationale'>) =>
  JSON.stringify([pair, kind, ...levels.map((level) => minimum[level] ?? null)]);

function countRelaxations(entries: readonly Omit<Relaxation, 'rationale'>[]) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = relaxationKey(entry);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

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

function loosening(current: Requirement, recorded: Requirement): string[] {
  const ways: string[] = [];
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
  recorded: DeclaredPairs | undefined;
  update: boolean;
  ci: boolean;
  base?: BaseSnapshot;
}

export interface BaseSnapshot {
  label: string;
  recorded: DeclaredPairs;
}

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
    const compared = base && compare(current, base.recorded, input.renamed, base.label);
    if (compared) problems.push(...compared.problems);
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

function compare(
  current: DeclaredPairs,
  recorded: DeclaredPairs,
  renamed: readonly { from: string; to: string }[],
  source: string,
): { problems: string[]; unspent: Map<string, number> } {
  const problems: string[] = [];
  const declared = new Set(Object.keys(current.pairs));
  const accounted = new Set([...current.dropped, ...current.renamed]);

  for (const name of [...Object.keys(recorded.pairs), ...(recorded.unrecorded ?? [])])
    if (!declared.has(name) && !accounted.has(name))
      problems.push(
        `${name} was declared (${source}) and is gone from tests/contrast/Pairs.ts: list it in dropped or renamed in tests/contrast/PairHistory.ts, with the reason.`,
      );

  const unspent = countRelaxations(current.relaxed);
  for (const [key, count] of countRelaxations(recorded.relaxed))
    unspent.set(key, (unspent.get(key) ?? 0) - count);
  const spend = (key: string) => {
    const left = unspent.get(key) ?? 0;
    if (left > 0) unspent.set(key, left - 1);
    return left > 0;
  };
  for (const [name, requirement] of Object.entries(current.pairs)) {
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

export function readSnapshot(file = declaredFile) {
  return existsSync(file)
    ? parseSnapshot(readFileSync(file, 'utf8'), file)
    : { recorded: undefined };
}

export type Git = (...args: string[]) => string;

const runGit: Git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const baseBranch = 'origin/dev';

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
