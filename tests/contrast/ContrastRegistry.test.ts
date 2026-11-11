// The contrast gate's registry and snapshot, in Node: every pair in tests/contrast/Pairs.ts is
// declared once, named, explained and measurable, Exceptions.json lists only pairs it measures, and
// DeclaredPairs.json records what each pair is held to (tests/contrast/Snapshot.ts), written afresh
// with `npm run test:contrast -- --update-snapshots`. tests/component/Contrast.test.tsx measures the
// pairs in the browser.
import { test } from 'node:test';
import { expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { cssColor, pairName, pairs } from './Pairs.ts';
import { dropped, relaxed, renamed } from './PairHistory.ts';
import {
  checkRenameTargets,
  checkSnapshot,
  declaredFile,
  formatSnapshot,
  readBaseSnapshot,
  readSnapshot,
} from './Snapshot.ts';
import { themes } from './Themes.ts';
import { exceptionsFile, readExceptions } from './Gate.ts';

const exceptions = readExceptions();

test('the pair registry and its exceptions agree', () => {
  const problems = [];
  const declared = new Set();
  for (const pair of pairs) {
    const name = pairName(pair);
    if (declared.has(name)) problems.push(`${name} is declared twice in tests/contrast/Pairs.ts.`);
    declared.add(name);
    for (const color of [pair.fg, ...pair.bg]) {
      try {
        cssColor(color);
      } catch (error) {
        problems.push(`${name}: ${error.message}`);
      }
    }
    const scoped = pair.contrast !== undefined || pair.minimum !== undefined;
    if (scoped && !pair.rationale?.trim())
      problems.push(
        `${name} is measured at one contrast only or below its kind's minimum: give it a rationale that says why WCAG doesn't require more.`,
      );
    if (!scoped && pair.rationale)
      problems.push(`${name} has a rationale but no scope or minimum: move it to its note.`);
    for (const theme of themes) {
      const lowered = pair.minimum?.[theme.contrast];
      if (lowered !== undefined && lowered >= theme.minimums[pair.kind])
        problems.push(
          `${name} lowers its ${theme.contrast} minimum to ${lowered}, which is not below its kind's.`,
        );
    }
  }
  for (const entry of dropped) {
    if (declared.has(entry.pair))
      problems.push(
        `${entry.pair} is listed as dropped in tests/contrast/PairHistory.ts but is still measured.`,
      );
    if (!entry.rationale.trim()) problems.push(`The dropped pair ${entry.pair} needs a rationale.`);
  }
  for (const entry of renamed) {
    if (declared.has(entry.from))
      problems.push(
        `${entry.from} is listed as renamed in tests/contrast/PairHistory.ts but is still declared.`,
      );
    if (!entry.rationale.trim()) problems.push(`The renamed pair ${entry.from} needs a rationale.`);
  }
  problems.push(...checkRenameTargets(renamed, declared, dropped));
  // What each pair is held to, against DeclaredPairs.json and the base branch's copy of it: see
  // tests/contrast/Snapshot.ts.
  const { base, note, problem } = readBaseSnapshot();
  if (problem) problems.push(problem);
  if (note) {
    console.log(note);
  }
  const working = readSnapshot();
  if (working.problem !== undefined) problems.push(working.problem);
  else {
    const snapshot = checkSnapshot({
      pairs,
      dropped,
      renamed,
      relaxed,
      themes,
      pairName,
      recorded: working.recorded,
      update: process.env.ENVUI_CONTRAST_UPDATE === '1',
      ci: Boolean(process.env.CI),
      base,
    });
    problems.push(...snapshot.problems);
    if (problems.length === 0 && snapshot.write)
      writeFileSync(declaredFile, formatSnapshot(snapshot.write));
  }
  const themeNames = new Set(themes.map((theme) => theme.name));
  const listed = new Set();
  for (const exception of exceptions) {
    const key = `${exception.pair} in ${exception.theme}`;
    if (listed.has(key)) problems.push(`${exceptionsFile} lists ${key} twice.`);
    listed.add(key);
    if (!declared.has(exception.pair))
      problems.push(
        `${exceptionsFile} lists ${exception.pair}, which tests/contrast/Pairs.ts doesn't declare: rename or remove the entry.`,
      );
    if (!themeNames.has(exception.theme))
      problems.push(
        `${exceptionsFile} lists ${key}, but tests/contrast/Themes.ts has no theme "${exception.theme}".`,
      );
    if (typeof exception.ratio !== 'number')
      problems.push(`${exceptionsFile}: ${key} needs the ratio it measured.`);
    if (!exception.note?.trim())
      problems.push(
        `${exceptionsFile}: ${key} needs a note saying why it fails and what fixes it.`,
      );
  }
  expect(problems.length, problems.join('\n')).toBe(0);
});
test('the snapshot fails on a weakened, deleted or unexplained pair', () => {
  const a = { fg: '--a', bg: ['--b'], kind: 'distinct' };
  const b = { fg: '--c', bg: ['--d'], kind: 'text' };
  const base = {
    pairs: [a, b],
    dropped: [{ pair: '--e on --f' }],
    renamed: [],
    relaxed: [],
    themes,
    pairName,
    update: false,
    ci: false,
  };
  const recorded = checkSnapshot({ ...base, recorded: undefined, update: true }).write;
  expect(recorded.pairs['--a on --b']).toEqual({
    kind: 'distinct',
    minimum: { standard: 0.03, high: 0.04 },
  });
  const check = (changes) => checkSnapshot({ ...base, ...changes, recorded }).problems;
  expect(check({})).toEqual([]);
  // A weaker kind, a lowered minimum, or a contrast no longer measured, keeping the name.
  expect(check({ pairs: [{ ...a, kind: 'difference' }, b] })).toEqual([
    expect.stringContaining('its kind went from distinct to the weaker difference'),
  ]);
  const lowered = { ...a, minimum: { standard: 0.02 }, rationale: 'Lowered.' };
  expect(check({ pairs: [lowered, b] })).toEqual([
    expect.stringContaining('its standard minimum went from 0.03 to 0.02'),
  ]);
  expect(check({ pairs: [a, { ...b, kind: 'non-text' }] })).toEqual([
    expect.stringContaining('the weaker non-text'),
  ]);
  expect(check({ pairs: [{ ...a, contrast: 'high', rationale: 'Scoped.' }, b] })).toEqual([
    expect.stringContaining('no longer measured at standard contrast'),
  ]);
  // A relaxation that lists the new requirement, with its rationale, accepts it; so does a
  // stronger requirement, which only asks for the snapshot to be updated.
  const relaxation = {
    pair: '--a on --b',
    kind: 'distinct',
    minimum: { standard: 0.02, high: 0.04 },
    rationale: 'Accepted for a reason.',
  };
  expect(check({ pairs: [lowered, b], relaxed: [relaxation] })).toEqual([
    expect.stringContaining('out of date'),
  ]);
  expect(check({ pairs: [{ ...a, minimum: { standard: 0.05 } }, b] })).toEqual([
    expect.stringContaining('out of date'),
  ]);
  expect(check({ pairs: [lowered, b], relaxed: [{ ...relaxation, rationale: ' ' }] })).toEqual([
    expect.stringContaining('needs a rationale'),
  ]);
  // A missing snapshot is written only on request, and never in CI.
  expect(checkSnapshot({ ...base, recorded: undefined }).problems).toEqual([
    expect.stringContaining('is missing'),
  ]);
  expect(checkSnapshot({ ...base, recorded: undefined, update: true, ci: true })).toEqual({
    problems: [expect.stringContaining('CI never writes it')],
    write: undefined,
  });
  // Recorded reasons can't be removed, even after --update-snapshots.
  expect(check({ pairs: [b] })).toEqual([
    expect.stringContaining('is gone from tests/contrast/Pairs.ts'),
  ]);
  expect(check({ dropped: [] })).toEqual([expect.stringContaining('recorded as dropped')]);
  const withRelaxation = checkSnapshot({
    ...base,
    pairs: [lowered, b],
    relaxed: [relaxation],
    recorded,
    update: true,
  }).write;
  expect(
    checkSnapshot({ ...base, pairs: [lowered, b], recorded: withRelaxation }).problems,
  ).toEqual([expect.stringContaining('no longer listed in relaxed')]);
});
test('the snapshot holds a renamed pair to what its old name recorded', () => {
  const a = { fg: '--a', bg: ['--b'], kind: 'text' };
  const base = { dropped: [], relaxed: [], themes, pairName, update: false, ci: false };
  const recorded = checkSnapshot({
    ...base,
    pairs: [a],
    renamed: [],
    recorded: undefined,
    update: true,
  }).write;
  const renamed = [{ from: '--a on --b', to: '--a2 on --b' }];
  const weaker = {
    fg: '--a2',
    bg: ['--b'],
    kind: 'non-text',
    minimum: { standard: 1.1, high: 1.1 },
    rationale: 'Lowered.',
  };
  const check = (pair, relaxed = []) =>
    checkSnapshot({ ...base, pairs: [pair], renamed, relaxed, recorded });
  // Renaming a pair keeps what it is held to: a weaker kind or minimum under the new name fails.
  expect(check(weaker).problems).toEqual([
    expect.stringMatching(
      /--a2 on --b, renamed from --a on --b, is held to less than .*the weaker non-text.*standard minimum went from 4\.5 to 1\.1/,
    ),
  ]);
  expect(check(weaker).write).toBeUndefined();
  expect(checkSnapshot({ ...base, pairs: [weaker], renamed, recorded, update: true })).toEqual({
    problems: [expect.stringContaining('renamed from --a on --b')],
  });
  // The same requirement under the new name only asks for the snapshot to be updated…
  expect(check({ ...a, fg: '--a2' }).problems).toEqual([expect.stringContaining('out of date')]);
  // …and a relaxation of the new name accepts the weaker one.
  const relaxation = {
    pair: '--a2 on --b',
    kind: 'non-text',
    minimum: { standard: 1.1, high: 1.1 },
    rationale: 'Accepted for a reason.',
  };
  expect(check(weaker, [relaxation]).problems).toEqual([expect.stringContaining('out of date')]);
  const written = checkSnapshot({
    ...base,
    pairs: [weaker],
    renamed,
    relaxed: [relaxation],
    recorded,
    update: true,
  }).write;
  expect(written.pairs['--a2 on --b']).toEqual({
    kind: 'non-text',
    minimum: { standard: 1.1, high: 1.1 },
  });
  // Once recorded, the new name is compared with its own record.
  expect(
    checkSnapshot({ ...base, pairs: [weaker], renamed, relaxed: [relaxation], recorded: written })
      .problems,
  ).toEqual([]);
});
test('a pair renamed onto a recorded name is held to both records', () => {
  const a = { fg: '--a', bg: ['--b'], kind: 'text' };
  const b = { fg: '--c', bg: ['--d'], kind: 'non-text' };
  const base = { dropped: [], relaxed: [], themes, pairName, update: false, ci: false };
  const recorded = checkSnapshot({
    ...base,
    pairs: [a, b],
    renamed: [],
    recorded: undefined,
    update: true,
  }).write;
  // A is folded into B, which keeps its own weaker requirement: A's text minimums are lost.
  const renamed = [{ from: '--a on --b', to: '--c on --d' }];
  expect(checkSnapshot({ ...base, pairs: [b], renamed, recorded }).problems).toEqual([
    expect.stringMatching(
      /--c on --d, renamed from --a on --b, is held to less than .*the weaker non-text/,
    ),
  ]);
  // Through a chain of renames too, while the first name is still in the snapshot.
  const chain = [
    { from: '--a on --b', to: '--a2 on --b' },
    { from: '--a2 on --b', to: '--a3 on --b' },
  ];
  const third = { ...a, fg: '--a3', kind: 'non-text' };
  expect(checkSnapshot({ ...base, pairs: [third, b], renamed: chain, recorded }).problems).toEqual([
    expect.stringContaining('--a3 on --b, renamed from --a on --b, is held to less'),
  ]);
  // Held to as much as A asked, B only asks for the snapshot to be updated.
  expect(
    checkSnapshot({ ...base, pairs: [{ ...b, kind: 'text' }], renamed, recorded }).problems,
  ).toEqual([expect.stringContaining('out of date')]);
});
test('a former rename target can be dropped or renamed onward', () => {
  const renamed = [{ from: '--a on --b', to: '--a2 on --b' }];
  const declared = new Set(['--a2 on --b']);
  expect(checkRenameTargets(renamed, declared, [])).toEqual([]);
  // The new name is dropped later…
  expect(checkRenameTargets(renamed, new Set(), [{ pair: '--a2 on --b' }])).toEqual([]);
  // …or renamed onward, to a name that is declared.
  const onward = [...renamed, { from: '--a2 on --b', to: '--a3 on --b' }];
  expect(checkRenameTargets(onward, new Set(['--a3 on --b']), [])).toEqual([]);
  // A target that is gone, or a chain that ends nowhere or comes back on itself, still fails.
  expect(checkRenameTargets(renamed, new Set(), [])).toEqual([
    expect.stringContaining('--a on --b is listed as renamed to --a2 on --b'),
  ]);
  expect(checkRenameTargets(onward, new Set(), [])).toHaveLength(2);
  const cycle = [...renamed, { from: '--a2 on --b', to: '--a on --b' }];
  expect(checkRenameTargets(cycle, new Set(), [])).toHaveLength(2);
});
test('the snapshot treats a switch between a distance and a ratio as a loosening', () => {
  const a = { fg: '--a', bg: ['--b'], kind: 'distinct' };
  const base = {
    dropped: [],
    renamed: [],
    relaxed: [],
    themes,
    pairName,
    update: false,
    ci: false,
  };
  const recorded = checkSnapshot({
    ...base,
    pairs: [a],
    recorded: undefined,
    update: true,
  }).write;
  const ratio = {
    ...a,
    kind: 'non-text',
    minimum: { standard: 1.01, high: 1.01 },
    rationale: 'Lowered.',
  };
  expect(checkSnapshot({ ...base, pairs: [ratio], recorded }).problems).toEqual([
    expect.stringContaining('its kind went from distinct, a ΔEOK distance, to non-text, a ratio'),
  ]);
  // Even the strongest ratio can't be compared with a distance, so it needs a relaxation too.
  expect(checkSnapshot({ ...base, pairs: [{ ...a, kind: 'text' }], recorded }).problems).toEqual([
    expect.stringContaining('to text, a ratio'),
  ]);
  const relaxation = {
    pair: '--a on --b',
    kind: 'non-text',
    minimum: { standard: 1.01, high: 1.01 },
    rationale: 'Measured as a ratio now.',
  };
  expect(
    checkSnapshot({ ...base, pairs: [ratio], relaxed: [relaxation], recorded }).problems,
  ).toEqual([expect.stringContaining('out of date')]);
  // The other way, from a ratio to a distance, too.
  const fromRatio = checkSnapshot({
    ...base,
    pairs: [{ ...a, kind: 'text' }],
    recorded: undefined,
    update: true,
  }).write;
  expect(checkSnapshot({ ...base, pairs: [a], recorded: fromRatio }).problems).toEqual([
    expect.stringContaining('its kind went from text, a ratio, to distinct, a ΔEOK distance'),
  ]);
  // Within one measure a stronger kind still only asks for the snapshot to be updated.
  const difference = checkSnapshot({
    ...base,
    pairs: [{ ...a, kind: 'difference' }],
    recorded: undefined,
    update: true,
  }).write;
  expect(checkSnapshot({ ...base, pairs: [a], recorded: difference }).problems).toEqual([
    expect.stringContaining('out of date'),
  ]);
});
test('a relaxation approves one loosening, once', () => {
  const a = { fg: '--a', bg: ['--b'], kind: 'distinct' };
  const base = { dropped: [], renamed: [], themes, pairName, ci: false };
  const lowered = { ...a, minimum: { standard: 0.02 }, rationale: 'Lowered.' };
  const relaxation = {
    pair: '--a on --b',
    kind: 'distinct',
    minimum: { standard: 0.02, high: 0.04 },
    rationale: 'Accepted for a reason.',
  };
  // Each run updates the snapshot, as `--update-snapshots` does.
  const run = (pairs, relaxed, recorded) =>
    checkSnapshot({ ...base, pairs, relaxed, recorded, update: true });
  const initial = run([a], []).write;
  // Relaxed to 0.02 and recorded, then tightened back to 0.03 and recorded.
  const relaxedOnce = run([lowered], [relaxation], initial);
  expect(relaxedOnce.problems).toEqual([]);
  const tightened = run([a], [relaxation], relaxedOnce.write);
  expect(tightened.problems).toEqual([]);
  expect(tightened.write.relaxed).toEqual([
    { pair: '--a on --b', kind: 'distinct', minimum: { standard: 0.02, high: 0.04 } },
  ]);
  // Lowering it to 0.02 again is a new relaxation: the recorded entry has been used.
  expect(run([lowered], [relaxation], tightened.write)).toEqual({
    problems: [expect.stringContaining('its standard minimum went from 0.03 to 0.02')],
  });
  // A second entry, with the reason for this time, accepts it, and is recorded beside the first.
  const again = { ...relaxation, rationale: 'Accepted again, for another reason.' };
  const relaxedTwice = run([lowered], [relaxation, again], tightened.write);
  expect(relaxedTwice.problems).toEqual([]);
  expect(relaxedTwice.write.relaxed).toHaveLength(2);
  // A new entry must relax something, so it can't be recorded in advance and used later.
  expect(run([a], [relaxation, again], tightened.write)).toEqual({
    problems: [expect.stringContaining('relaxes nothing')],
  });
});
test("the base branch's snapshot catches a snapshot edited along with the pairs", () => {
  const a = { fg: '--a', bg: ['--b'], kind: 'distinct' };
  const lowered = { ...a, minimum: { standard: 0.02 }, rationale: 'Lowered.' };
  const relaxation = {
    pair: '--a on --b',
    kind: 'distinct',
    minimum: { standard: 0.02, high: 0.04 },
    rationale: 'Accepted for a reason.',
  };
  const common = { dropped: [], renamed: [], themes, pairName, ci: false };
  const record = (pairs, relaxed, recorded) =>
    checkSnapshot({ ...common, pairs, relaxed, recorded, update: true }).write;
  const onBase = record([a], []);
  const base = { label: 'the base snapshot', recorded: onBase };
  const check = (pairs, relaxed, recorded) =>
    checkSnapshot({ ...common, pairs, relaxed, recorded, update: false, base }).problems;
  // The snapshot written by hand to match the lowered pair passes against itself alone…
  const edited = record([lowered], []);
  expect(
    checkSnapshot({ ...common, pairs: [lowered], relaxed: [], recorded: edited, update: false })
      .problems,
  ).toEqual([]);
  // …but not against the base.
  expect(check([lowered], [], edited)).toEqual([
    expect.stringContaining('is held to less than the base snapshot records'),
  ]);
  // Nor does deleting the snapshot and recording it afresh, which compares with the base too.
  const afresh = (relaxed) =>
    checkSnapshot({
      ...common,
      pairs: [lowered],
      relaxed,
      recorded: undefined,
      update: true,
      base,
    });
  expect(afresh([])).toEqual({
    problems: [expect.stringContaining('is held to less than the base snapshot records')],
    write: undefined,
  });
  expect(afresh([relaxation]).problems).toEqual([]);
  expect(afresh([relaxation]).write?.pairs).toEqual(record([lowered], []).pairs);
  // A relaxation new since the base accepts it, recorded on the branch or not.
  const relaxedOnBranch = record([lowered], [relaxation], onBase);
  expect(check([lowered], [relaxation], relaxedOnBranch)).toEqual([]);
  // One the base has recorded is spent there, so it can't approve another loosening.
  const tightenedOnBase = record([a], [relaxation], record([lowered], [relaxation], onBase));
  const laterBase = { label: 'the base snapshot', recorded: tightenedOnBase };
  const editedLater = { ...tightenedOnBase, pairs: record([lowered], []).pairs };
  expect(
    checkSnapshot({
      ...common,
      pairs: [lowered],
      relaxed: [relaxation],
      recorded: editedLater,
      update: false,
      base: laterBase,
    }).problems,
  ).toEqual([expect.stringContaining('is held to less than the base snapshot records')]);
  // A relaxation recorded on the base can't be deleted from PairHistory.ts and the snapshot together.
  const withoutIt = { ...tightenedOnBase, relaxed: [] };
  expect(
    checkSnapshot({
      ...common,
      pairs: [a],
      relaxed: [],
      recorded: withoutIt,
      update: false,
      base: laterBase,
    }).problems,
  ).toEqual([expect.stringContaining('is recorded (the base snapshot) but no longer listed')]);
  // One recorded only on the branch can, along with the loosening it approved.
  expect(check([a], [], record([a], []))).toEqual([]);
  // Tightened back on the branch, a spent relaxation may stay as history.
  expect(check([a], [relaxation], record([a], [relaxation], relaxedOnBranch))).toEqual([]);
});
test("the base is the one asked for, or else origin/dev's unless it is the branch's own", () => {
  const snapshot = JSON.stringify({ pairs: {}, dropped: [], renamed: [], relaxed: [] });
  /** A clone where each command answers as listed, and any other fails as git would. */
  const clone =
    (answers) =>
    (...args) => {
      const answer = answers[args.join(' ')];
      if (answer === undefined) throw new Error(`git ${args.join(' ')} failed`);
      return answer;
    };
  const show = (commit) => `show ${commit}:${declaredFile}`;
  const upstream = (branch) => `for-each-ref --format=%(upstream:short) refs/heads/${branch}`;
  const basic = {
    'symbolic-ref --quiet --short HEAD': 'topic',
    [upstream('topic')]: '',
    'merge-base HEAD origin/dev': 'dev00000old',
    [show('dev00000old')]: snapshot,
  };
  const based = readBaseSnapshot({ requested: '', git: clone(basic) });
  expect(based.problem).toBeUndefined();
  expect(based.base?.label).toContain('dev00000, the merge-base with origin/dev');
  expect(based.note).toContain('ENVUI_CONTRAST_BASE');
  // A branch's own copy is no base, as it holds the branch's edits: its namesake on origin, as on
  // dev itself, and the branch it tracks, whatever its name.
  const itself = readBaseSnapshot({
    requested: '',
    git: clone({ ...basic, 'symbolic-ref --quiet --short HEAD': 'dev', [upstream('dev')]: '' }),
  });
  expect(itself.base).toBeUndefined();
  expect(itself.note).toContain("Skipping origin/dev, this branch's own copy.");
  const tracking = readBaseSnapshot({
    requested: '',
    git: clone({ ...basic, [upstream('topic')]: 'origin/dev' }),
  });
  expect(tracking.base).toBeUndefined();
  expect(tracking.note).toContain("Skipping origin/dev, this branch's own copy.");
  // A detached HEAD, as in CI, has no copies of its own.
  const detached = { ...basic, 'symbolic-ref --quiet --short HEAD': undefined };
  expect(readBaseSnapshot({ requested: '', git: clone(detached) }).base).toBeDefined();
  // Without one, the gate compares with the working tree's snapshot alone, and the note says how
  // to compare with a base.
  const none = readBaseSnapshot({ requested: '', git: clone({}) });
  expect(none.base).toBeUndefined();
  expect(none.problem).toBeUndefined();
  expect(none.note).toMatch(/No merge-base with origin\/dev .* Set ENVUI_CONTRAST_BASE/);
  const predating = readBaseSnapshot({
    requested: '',
    git: clone({ 'merge-base HEAD origin/dev': 'dev00000old' }),
  });
  expect(predating.base).toBeUndefined();
  expect(predating.note).toMatch(/doesn't exist at the merge-base with origin\/dev \(dev00000\)/);
  // A base that was asked for is the only one, and fails when git can't find it or it lacks the
  // file.
  const asked = (git) => readBaseSnapshot({ requested: 'v1', git });
  const v1 = { 'rev-parse --verify v1^{commit}': 'v1000000abc' };
  expect(asked(clone({ ...basic, ...v1, [show('v1000000abc')]: snapshot })).base).toEqual({
    label: expect.stringContaining('at v1 (ENVUI_CONTRAST_BASE)'),
    recorded: expect.anything(),
  });
  expect(asked(clone({})).problem).toContain("which git can't find");
  expect(asked(clone(v1))).toEqual({ problem: expect.stringContaining("doesn't exist") });
});
test('a snapshot recorded afresh records no relaxation that relaxed nothing', () => {
  const a = { fg: '--a', bg: ['--b'], kind: 'distinct' };
  const lowered = { ...a, minimum: { standard: 0.02 }, rationale: 'Lowered.' };
  const relaxation = {
    pair: '--a on --b',
    kind: 'distinct',
    minimum: { standard: 0.02, high: 0.04 },
    rationale: 'Accepted for a reason.',
  };
  const common = { dropped: [], renamed: [], themes, pairName, ci: false };
  const record = (pairs, relaxed, recorded) =>
    checkSnapshot({ ...common, pairs, relaxed, recorded, update: true }).write;
  const afresh = (pairs, base) =>
    checkSnapshot({
      ...common,
      pairs,
      relaxed: [relaxation],
      recorded: undefined,
      update: true,
      base,
    });
  const base = { label: 'the base snapshot', recorded: record([a], []) };
  // Against a base, an entry must approve a loosening since it, or be recorded there.
  expect(afresh([a], base)).toEqual({
    problems: [expect.stringContaining('which relaxes nothing the base snapshot records')],
    write: undefined,
  });
  expect(afresh([lowered], base).problems).toEqual([]);
  const spent = {
    label: 'the newer base',
    recorded: record([a], [relaxation], record([lowered], [relaxation], base.recorded)),
  };
  expect(afresh([a], spent).problems).toEqual([]);
  // Without a snapshot or a base, nothing records what it relaxed.
  expect(afresh([lowered])).toEqual({
    problems: [
      expect.stringContaining(
        `neither ${declaredFile} nor a base branch's copy records what it relaxed`,
      ),
    ],
    write: undefined,
  });
});
