import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readProps } from '../../scripts/docs/PageStructure.ts';

const ownProps = Object.entries(readProps()!.exports).flatMap(([name, entry]) =>
  ('props' in entry ? (entry.props ?? []) : [])
    .filter((prop) => prop.source !== 'base-ui')
    .map((prop) => ({ component: name, ...prop })),
);
const named = (prop: { component: string; name: string }) => `${prop.component}.${prop.name}`;

const featuresShownByDefault = new Set([
  'Breadcrumbs.wrap',
  'CodeDiff.header',
  'ColorPicker.copyable',
  'ColorPicker.eyeDropper',
  'ColorPicker.fields',
  'ColorPicker.visibleLabel',
  'ColorPickerButton.copyable',
  'ColorPickerButton.eyeDropper',
  'ColorPickerButton.fields',
  'Combobox.visibleLabel',
  'CommandPalette.closeOnAction',
  'DatePicker.visibleLabel',
  'Dialog.closeButton',
  'Dialog.modal',
  'DropZone.target',
  'HoverCard.underline',
  'Link.underline',
  'Menu.Item.closeOnClick',
  'MonthPicker.visibleLabel',
  'NavigationBar.visibleLabel',
  'NavigationRail.visibleLabel',
  'Page.gutter',
  'PageHeader.focusOnNavigation',
  'Pagination.hasNextPage',
  'Panes.ResizeHandle.grip',
  'RelativeTime.tooltip',
  'ResizeHandle.grip',
  'Scaffold.landmarks',
  'Select.visibleLabel',
  'Sheet.closeButton',
  'Sheet.modal',
  'TextField.visibleLabel',
  'ThemePreferenceProvider.applyToDocument',
  'TimePicker.visibleLabel',
  'Toolbar.Root.loopFocus',
  'Tooltip.underline',
]);

const defaultsOfNoState: Record<string, string> = {
  'ToastProvider.defaultPlacement': 'the placement of each notification whose show() names none',
};

test('a boolean defaults to false, unless it is named after a feature shown by default', () => {
  const trueByDefault = ownProps
    .filter((prop) => prop.type === 'boolean' && prop.default === 'true')
    .map(named);
  assert.deepEqual(
    trueByDefault.filter((name) => !featuresShownByDefault.has(name)),
    [],
    'Default these to false, or, for a feature shown by default, name the prop after the feature and list it in featuresShownByDefault.',
  );
  assert.deepEqual(
    [...featuresShownByDefault].filter((name) => !trueByDefault.includes(name)),
    [],
    'These no longer default to true: remove them from featuresShownByDefault.',
  );
});

test('a default<X> prop comes with <x> and on<X>Change, the controlled value it starts', () => {
  const byComponent = new Map<string, typeof ownProps>();
  for (const prop of ownProps)
    byComponent.set(prop.component, [...(byComponent.get(prop.component) ?? []), prop]);
  const incomplete: string[] = [];
  for (const [component, props] of byComponent) {
    const names = new Set(props.map((prop) => prop.name));
    for (const name of names) {
      const value = /^default([A-Z]\w*)$/.exec(name)?.[1];
      if (!value || Object.hasOwn(defaultsOfNoState, `${component}.${name}`)) continue;
      const missing = [value[0]!.toLowerCase() + value.slice(1), `on${value}Change`].filter(
        (partner) => !names.has(partner),
      );
      if (missing.length) incomplete.push(`${component}.${name} lacks ${missing.join(' and ')}`);
    }
  }
  assert.deepEqual(incomplete, []);
  for (const name of Object.keys(defaultsOfNoState))
    assert.ok(
      ownProps.some((prop) => named(prop) === name),
      `${name} is gone: remove it from defaultsOfNoState`,
    );
});
