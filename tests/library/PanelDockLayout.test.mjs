// How PanelDock chooses its panels (packages/ui/src/layout/panel-dock/internal/dockLayout.ts): the
// panel that fills a stacked dock, the one a tab's press keeps showing, and the one to minimize
// first. tests/component/PanelDock.test.tsx checks the dock that applies them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';

const { fillCandidates, fitsInRow, heldChoice, newest, oldest } = await importSource(
  'PanelDockLayout',
  'packages/ui/src/layout/panel-dock/internal/dockLayout.ts',
);

const panel = (id, mode = 'open') => ({ id, title: id, mode });
const ids = (panels) => panels.map(({ id }) => id);

test('a stacked dock fills with any panel not minimized, a wide one only with a maximized panel', () => {
  const panels = [panel('report'), panel('notes', 'maximized'), panel('budget', 'minimized')];
  assert.deepEqual(ids(fillCandidates(panels, true)), ['report', 'notes']);
  assert.deepEqual(ids(fillCandidates(panels, false)), ['notes']);
  assert.deepEqual(fillCandidates([panel('report')], false), []);
});

test('without an active panel the newest fills a stacked dock, one never recorded newest of all', () => {
  const times = new Map([
    ['ex', 1],
    ['why', 2],
  ]);
  assert.equal(newest([panel('ex'), panel('why')], times).id, 'why');
  // A panel that opens afterwards has no time yet, so it fills the dock.
  assert.equal(newest([panel('ex'), panel('why'), panel('zed-2')], times).id, 'zed-2');
  assert.equal(newest([], times), undefined);
});

test("a tab's press keeps its panel showing while the same panel is active, until another opens or comes forward", () => {
  const panels = [panel('first'), panel('second'), panel('third', 'minimized')];
  const times = new Map([
    ['first', 1],
    ['second', 2],
    ['third', 3],
  ]);
  // A tab showed Second while First was active, which the application never changes: Second
  // shows, also without onActivate; Third, minimized though brought forward later, takes nothing
  // over.
  const choice = { id: 'second', active: 'first', time: 2 };
  assert.equal(heldChoice(choice, panels, 'first', times), 'second');
  // A panel that opens since, not recorded yet, shows in place of the one the tab showed.
  assert.equal(heldChoice(choice, [...panels, panel('fourth')], 'first', times), 'fourth');
  // Another active panel ends the choice, which leaves the newest to fill the dock: a tab pressed
  // while the panels sat side by side holds nothing once people work in another panel.
  assert.equal(heldChoice(choice, panels, 'second', times), undefined);
  assert.equal(heldChoice(null, panels, 'first', times), undefined);
  // A panel that closed holds nothing, unless one came forward after it.
  assert.equal(
    heldChoice({ id: 'gone', active: 'first', time: 5 }, panels, 'first', times),
    undefined,
  );
});

test('the panel to minimize first is the one brought forward longest ago, and panels fit side by side to the pixel', () => {
  const times = new Map([
    ['review', 2],
    ['plan', 1],
    ['retro', 3],
  ]);
  assert.equal(oldest([panel('review'), panel('plan'), panel('retro')], times).id, 'plan');
  // Of the panels never recorded, the first.
  assert.equal(oldest([panel('a'), panel('b')], new Map()).id, 'a');
  assert.equal(oldest([], times), undefined);
  // Two panels of 320 px and a gap of 8 px need 648 px; a pixel short of it is rounding.
  assert.equal(fitsInRow({ size: 648, gap: 8 }, [320, 320]), true);
  assert.equal(fitsInRow({ size: 647, gap: 8 }, [320, 320]), true);
  assert.equal(fitsInRow({ size: 646, gap: 8 }, [320, 320]), false);
  assert.equal(fitsInRow({ size: 100, gap: 8 }, []), true);
});
