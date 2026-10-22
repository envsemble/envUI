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
const featureCard = map.structure['@envsemble/envui'].FeatureCard;
const drawer = map.structure['@envsemble/envui'].Drawer;
const loadingState = map.structure['@envsemble/envui'].LoadingState;
const closeButton = map.structure['@envsemble/envui'].CloseButton;
const button = map.structure['@envsemble/envui'].Button;
const counterBadge = map.structure['@envsemble/envui'].CounterBadge;

/** The fixtures that run with a map of the tests' own, for rules the v1 map has no entry for. */
const maps = { 'wrap.tsx': join(packageDirectory, 'test/maps/structure.json') };

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  // A tone that is an expression stays: an accent count is solid.
  'badges.tsx': [`line 10: CounterBadge: ${counterBadge.report}`],
  // CloseButton's default name and Button iconOnly without a variant are reported where rewritten;
  // an iconOnly that is an expression stays.
  // Props IconButton doesn't take are reported where Button iconOnly set them.
  'buttons.tsx': [
    `line 8: Button: ${button.report}`,
    `line 12: Button: ${button.cases[0].report}`,
    `line 13: Button's fullWidth: ${button.cases[0].reportProps.fullWidth}`,
    `line 13: Button's tone: ${button.cases[0].reportProps.tone}`,
    `line 13: Button: ${button.cases[0].report}`,
    `line 14: Button's underline: ${button.cases[1].reportProps.underline}`,
    `line 15: CloseButton: ${closeButton.cases[0].report}`,
  ],
  'list-contrast.tsx': [`line 6: List.Root: ${listRoot.report}`],
  // Reported and left as they are: the prerelease's Drawer and a LoadingState's child.
  'prerelease.tsx': [
    `line 9: Drawer: ${drawer.cases[0].report}`,
    `line 15: LoadingState: ${loadingState.cases[1].children['*'].report}`,
  ],
  'dialog-drawer.tsx': [`line 11: Dialog: ${dialog.report}`],
  'list-detail.tsx': [
    `line 6: ListDetail.Root: its spread props may set what decides its 1.0 form, so it stays. ${listDetail.report}`,
    `line 7: ListDetail.Root: ${listDetail.cases[0].report}`,
  ],
  'cards.tsx': [
    `line 7: FeatureCard: ${featureCard.report}`,
    `line 13: Card: ${card.report}`,
    `line 14: Card: ${card.cases[0].report}`,
    `line 24: ActionCard: ${actionCard.cases[0].report}`,
  ],
  'action-group.tsx': [
    `line 17: Button: ${button.cases[0].report}`,
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
    // A second run changes nothing more, and reports again what it could not rewrite or only reports.
    const again = runTransform(v1Structure, fixture.path, result.output, options);
    assert.equal(again.output, result.output);
    assert.deepEqual(
      again.reports,
      result.reports.filter(
        (report) =>
          report.endsWith(actionGroup.report) ||
          report.endsWith(button.report) ||
          report.endsWith(counterBadge.report) ||
          report.endsWith(featureCard.report) ||
          report.endsWith(listRoot.report) ||
          report.endsWith(dialog.report) ||
          report.endsWith(card.report) ||
          report.endsWith(listDetail.report) ||
          report.endsWith(drawer.cases[0].report) ||
          report.endsWith(loadingState.cases[1].children['*'].report),
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

test('v1-structure imports the icon an element gets, in the quotes of the file', () => {
  const source = [
    'import { CloseButton } from "@envsemble/envui";',
    '',
    'export const Close = 1;',
    'export const Dismiss = () => <CloseButton aria-label="Dismiss" />;',
    '',
  ].join('\n');
  const { output } = runTransform(v1Structure, 'dismiss.tsx', source);
  assert.match(output, /^import \{ Close as EnvClose \} from "@envsemble\/envui\/icons\/Close";$/m);
  assert.match(
    output,
    /<IconButton variant="ghost" icon=\{<EnvClose \/>\} aria-label="Dismiss" \/>/,
  );
});

test('v1-structure reuses an icon the file imports from the icons barrel', () => {
  const source = [
    "import { CloseButton } from '@envsemble/envui';",
    "import { Close as Cross } from '@envsemble/envui/icons';",
    '',
    'export const Dismiss = () => <CloseButton aria-label="Dismiss" />;',
    '',
  ].join('\n');
  const { output } = runTransform(v1Structure, 'dismiss.tsx', source);
  assert.match(output, /^import \{ IconButton \} from '@envsemble\/envui';$/m);
  assert.match(output, /<IconButton variant="ghost" icon=\{<Cross \/>\} aria-label="Dismiss" \/>/);
  assert.doesNotMatch(output, /icons\/Close'/);
});

test('v1-structure leaves files without envUI imports alone', () => {
  const source = "import { ActionGroup } from 'other';\n<ActionGroup />;\n";
  assert.equal(runTransform(v1Structure, 'other.tsx', source).skipped, true);
});
