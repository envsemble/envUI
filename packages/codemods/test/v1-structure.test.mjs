import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import * as v1Structure from '../src/transforms/v1-structure.mjs';
import { encodings, fixtures, map, packageDirectory, runTransform } from './helpers.mjs';

const actionGroup = map.structure['@envsemble/envui'].ActionGroup;
const listRoot = map.structure['@envsemble/envui']['List.Root'];
const dialog = map.structure['@envsemble/envui'].Dialog;
const card = map.structure['@envsemble/envui'].Card;
const listDetail = map.structure['@envsemble/envui']['ListDetail.Root'];
const actionCard = map.structure['@envsemble/envui'].ActionCard;

/** The fixtures that run with a map of the tests' own, for rules the v1 map has no entry for. */
const maps = { 'wrap.tsx': join(packageDirectory, 'test/maps/structure.json') };

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  'list-contrast.tsx': [`line 6: List.Root: ${listRoot.report}`],
  'dialog-drawer.tsx': [`line 11: Dialog: ${dialog.report}`],
  'list-detail.tsx': [
    `line 6: ListDetail.Root: its spread props may set what decides its 1.0 form, so it stays. ${listDetail.report}`,
    `line 7: ListDetail.Root: ${listDetail.cases[0].report}`,
  ],
  'cards.tsx': [
    `line 7: Card: ${card.report}`,
    `line 8: Card: ${card.cases[0].report}`,
    `line 24: ActionCard: ${actionCard.cases[0].report}`,
  ],
  'action-group.tsx': [
    `line 19: ActionGroup: ${actionGroup.cases[0].children['*'].report}`,
    `line 21: ActionGroup: ${actionGroup.report}`,
  ],
  'spread.tsx': [
    `line 6: ActionGroup: its spread props may set what decides its 1.0 form, so it stays. ${actionGroup.report}`,
    "line 10: ActionGroup: this child's spread props may set iconOnly or fullWidth, so it doesn't get fullWidth: add it if it should.",
  ],
};

for (const fixture of fixtures('v1-structure')) {
  test(`v1-structure: ${fixture.name}`, () => {
    const options = maps[fixture.name] ? { map: maps[fixture.name] } : {};
    const result = runTransform(v1Structure, fixture.path, fixture.input, options);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
    // A second run changes nothing more, and reports only the elements it could not rewrite.
    const again = runTransform(v1Structure, fixture.path, result.output, options);
    assert.equal(again.output, result.output);
    assert.deepEqual(
      again.reports,
      result.reports.filter(
        (report) =>
          report.endsWith(actionGroup.report) ||
          report.endsWith(listRoot.report) ||
          report.endsWith(dialog.report) ||
          report.endsWith(card.report) ||
          report.endsWith(listDetail.report),
      ),
    );
  });
}

test('v1-structure keeps line endings and a byte order mark', () => {
  const fixture = fixtures('v1-structure').find(({ name }) => name === 'action-group.tsx');
  for (const [name, encode] of encodings) {
    const result = runTransform(v1Structure, fixture.path, encode(fixture.input));
    assert.equal(result.output, encode(fixture.output), name);
  }
});

test('v1-structure imports the new element under a free name and drops the unused old import', () => {
  const source = [
    "import { ActionGroup, Button } from '@envsemble/envui';",
    "import { Stack } from './layout';",
    '',
    'export const Actions = () => (',
    '  <Stack>',
    '    <ActionGroup>',
    '      <Button>Save</Button>',
    '    </ActionGroup>',
    '  </Stack>',
    ');',
    '',
  ].join('\n');
  const { output } = runTransform(v1Structure, 'actions.tsx', source);
  assert.match(output, /import \{ Button, Stack as EnvStack \} from '@envsemble\/envui';/);
  assert.match(output, /<EnvStack direction="row" wrap align="center" gap=\{4\}>/);
  assert.match(output, /<\/EnvStack>\n {2}<\/Stack>/);
});

test('v1-structure leaves files without envUI imports alone', () => {
  const source = "import { ActionGroup } from 'other';\n<ActionGroup />;\n";
  assert.equal(runTransform(v1Structure, 'other.tsx', source).skipped, true);
});
