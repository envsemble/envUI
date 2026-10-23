import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as v1Props from '../src/transforms/v1-props.mjs';
import { encodings, fixtures, map, packageDirectory, runTransform } from './helpers.mjs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const props = map.props['@envsemble/envui'];
const report = (component, prop, value, entry = props) => {
  const rule = entry[component][prop];
  return value === undefined ? rule.report : rule.values[value].report;
};
const content = map.props['@envsemble/envui/content'];
const richText = map.props['@envsemble/envui/rich-text'];

/** The fixtures that run with a map of the tests' own, for sections the v1 map has no entries in. */
const maps = { 'calls.tsx': join(packageDirectory, 'test/maps/calls.json') };
const callsMap = JSON.parse(readFileSync(maps['calls.tsx'], 'utf8')).calls['@envsemble/envui'];

/** What each fixture reports, in line order; a fixture that is not listed reports nothing. */
const reports = {
  'calls.tsx': [
    `line 10: useToast().show takes an object the codemod can't read: ${callsMap['useToast().show'].variant.report} ${callsMap['useToast().show'].placement.report}`,
  ],
  'emphasis.tsx': [
    `line 14: Button's variant has a value the codemod can't move: ${report('Button', 'variant')}`,
    `line 20: Text's tone is emphasis now, with a value the codemod can't check: ${report('Text', 'tone')}`,
  ],
  'density.tsx': [
    `line 5: Surface's density: ${report('Surface', 'density', 'compact')}`,
    `line 10: Table.Root's density has a value the codemod can't move: ${report('Table.Root', 'density')}`,
  ],
  'content.tsx': [
    `line 25: Card's layout: ${report('Card', 'layout', 'action')}`,
    // The feature layout is a pattern now: the prop and its icon stay, reported.
    `line 27: Card's layout has a value the codemod can't move: ${report('Card', 'layout')}`,
    `line 27: ${report('Card', 'icon')}`,
    `line 29: Avatar's size has a value the codemod can't move: ${report('Avatar', 'size')}`,
  ],
  'form-vocabulary.tsx': [
    `line 19: TextField's variant has a value the codemod can't move: ${report('TextField', 'variant')}`,
    `line 23: Combobox's items has entries the codemod can't read: ${report('Combobox', 'items')}`,
  ],
  'color-picker.tsx': [
    `line 8: ColorPicker's variant has a value the codemod can't move: ${report('ColorPicker', 'variant')}`,
  ],
  'rich-text.tsx': [
    `line 9: RichTextEditor's variant has a value the codemod can't move: ${report('RichTextEditor', 'variant', undefined, richText)}`,
  ],
  // Data a prop takes, such as Combobox's items, is renamed in an array written in the prop and
  // reported where the codemod can't read it.
  'renames.tsx': [
    `line 26: Combobox's items has entries the codemod can't read: ${report('Combobox', 'items')}`,
  ],
  'panel-dock.tsx': [
    `line 8: PanelDock.Header's controls has a value the codemod can't move: ${report('PanelDock.Header', 'controls')}`,
  ],
  'markdown-editor.tsx': [`line 9: ${report('MarkdownEditor', 'className', undefined, content)}`],
  // A report-only rule leaves the prop as it is and reports every use, on every run.
  'root-styles.tsx': [
    `line 6: ${report('TextField', 'className')}`,
    `line 7: ${report('Checkbox', 'style')}`,
    `line 8: ${report('Switch', 'className')}`,
    `line 8: ${report('Switch', 'style')}`,
    `line 10: ${report('Radio', 'className')}`,
  ],
  'disclosure.tsx': [`line 4: ${report('Disclosure', 'onToggle')}`],
  // Conditionals map each literal value; an expression beside them, or a value that maps to
  // several props, is reported.
  'conditionals.tsx': [
    `line 10: Alert's tone has a value the codemod can't move: ${report('Alert', 'tone')}`,
    `line 16: Text's tone is emphasis now, with a value the codemod can't check: ${report('Text', 'tone')}`,
    `line 18: Button's variant has a value the codemod can't move: ${report('Button', 'variant')}`,
    `line 19: Card's layout: ${report('Card', 'layout', 'action')}`,
  ],
  // Code's appearance, Markdown's inlineCode and CodeBlock's theme went in 0.7; an expression stays.
  'code.tsx': [
    `line 8: Code's appearance has a value the codemod can't move: ${report('Code', 'appearance', undefined, content)}`,
    // A literal beside an expression stays, rather than becoming undefined in a prop 1.0 removed.
    `line 9: Code's appearance has a value the codemod can't move: ${report('Code', 'appearance', undefined, content)}`,
  ],
  'fields.tsx': [
    `line 7: TextField's compact: ${report('TextField', 'compact', 'true')}`,
    `line 8: TextField's compact: ${report('TextField', 'compact', 'true')}`,
    `line 9: TextField's compact: ${report('TextField', 'compact', 'false')}`,
    `line 12: Combobox's density: ${report('Combobox', 'density', 'standard')}`,
  ],
};

/** The reports of the rules that only report, which every run repeats. */
const reportOnly = Object.values(map.props)
  .flatMap((components) => Object.values(components))
  .flatMap((rules) => Object.values(rules))
  .filter((rule) => rule.to === undefined && rule.values === undefined)
  .map((rule) => rule.report);

test('report-only rules cover className and style wherever they moved to the root', () => {
  for (const [entry, component] of [
    ...['TextField', 'SearchField', 'Textarea', 'Select', 'Combobox', 'DatePicker', 'Checkbox']
      .concat(['Switch', 'Radio'])
      .map((name) => [props, name]),
    [content, 'MarkdownEditor'],
  ])
    for (const prop of ['className', 'style'])
      assert.match(entry[component][prop].report, /root element/, `${component}'s ${prop}`);
});

for (const fixture of fixtures('v1-props')) {
  test(`v1-props: ${fixture.name}`, () => {
    const options = maps[fixture.name] ? { map: maps[fixture.name] } : {};
    const result = runTransform(v1Props, fixture.path, fixture.input, options);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, reports[fixture.name] ?? []);
    // A second run changes nothing more, and reports only the values it could not move before
    // and the uses of report-only props.
    const again = runTransform(v1Props, fixture.path, result.output, options);
    assert.equal(again.output, result.output);
    assert.deepEqual(
      again.reports,
      result.reports.filter(
        (report) =>
          report.includes("can't move") ||
          report.includes("can't read") ||
          reportOnly.some((message) => report.endsWith(`: ${message}`)),
      ),
    );
  });
}

test('v1-props reads calls from a map folder, as the bundled map stores them', () => {
  const fixture = fixtures('v1-props').find(({ name }) => name === 'calls.tsx');
  const fromFile = runTransform(v1Props, fixture.path, fixture.input, { map: maps['calls.tsx'] });
  const fromFolder = runTransform(v1Props, fixture.path, fixture.input, {
    map: join(packageDirectory, 'test/maps/calls-folder'),
  });
  assert.equal(fromFolder.output, fixture.output);
  assert.deepEqual(fromFolder.reports, fromFile.reports);
});

test('v1-props keeps line endings and a byte order mark', () => {
  const fixture = fixtures('v1-props').find(({ name }) => name === 'density.tsx');
  for (const [name, encode] of encodings) {
    const result = runTransform(v1Props, fixture.path, encode(fixture.input));
    assert.equal(result.output, encode(fixture.output), name);
  }
});

test('v1-props leaves files without envUI imports alone', () => {
  const source = 'import { Select } from \'other\';\n<Select density="compact" />;\n';
  assert.equal(runTransform(v1Props, 'other.tsx', source).skipped, true);
});
