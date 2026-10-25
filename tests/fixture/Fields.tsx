import type { ReactNode } from 'react';
import {
  Card,
  Column,
  Combobox,
  DatePicker,
  Field,
  MonthPicker,
  SearchField,
  Select,
  Surface,
  Textarea,
  TextField,
  Theme,
  TimePicker,
} from '@envsemble/envui';
import { ColorPicker, ColorPickerButton } from '@envsemble/envui/color';
import { MarkdownEditor } from '@envsemble/envui/content';
import { RichTextEditor } from '@envsemble/envui/rich-text';
import { people } from './Comboboxes.js';
import { dialogOptions } from './SelectOptions.js';

/** Every field and editor, each in a box named for its kind. */
function Fields() {
  const fields: [string, ReactNode][] = [
    ['text-field', <TextField label="Name" defaultValue="Sam Lee" />],
    ['floating', <TextField variant="floating" label="Floating" defaultValue="Sam Lee" />],
    ['textarea', <Textarea label="Note" defaultValue="Ship on Friday." />],
    ['search-field', <SearchField label="Search" />],
    [
      'select',
      <Select label="Plan" items={dialogOptions} variant="outline" defaultValue="aurora" />,
    ],
    ['combobox', <Combobox label="Owner" items={people} />],
    ['date-picker', <DatePicker label="Publish on" defaultValue="2026-10-20" />],
    ['time-picker', <TimePicker label="Starts at" defaultValue="09:30" />],
    ['month-picker', <MonthPicker label="Month" defaultValue="2026-10" />],
    ['color-picker-button', <ColorPickerButton label="Accent" defaultValue="#2f6f62" />],
    ['color-picker', <ColorPicker label="Brand" defaultValue="#2f6f62" />],
    [
      'markdown-editor',
      <MarkdownEditor label="Notes" rows={3} defaultValue="**Ship** on Friday." />,
    ],
    ['rich-text-editor', <RichTextEditor label="Body" defaultValue="Ship on Friday." />],
    [
      'field',
      <Field.Root>
        <Field.Label>Custom field</Field.Label>
        <Field.Control defaultValue="Sam Lee" />
      </Field.Root>,
    ],
  ];
  return (
    <Column gap={4}>
      {fields.map(([kind, field]) => (
        <div key={kind} data-field={kind}>
          {field}
        </div>
      ))}
    </Column>
  );
}

/**
 * Every field and editor on the page, a card, a muted surface and a popup surface, as on a sheet
 * or in a dialog, in the light and the dark theme, mounted with ?fixture=fields.
 */
export function FieldsFixture() {
  return (
    <Column gap={6}>
      {(['light', 'dark'] as const).map((theme) => (
        <Theme key={theme} theme={theme} style={{ padding: '1rem' }}>
          <Column gap={6}>
            <div data-testid={`${theme}-page`}>
              <Fields />
            </div>
            <Card>
              <div data-testid={`${theme}-card`}>
                <Fields />
              </div>
            </Card>
            <Surface background="muted">
              <div data-testid={`${theme}-muted`}>
                <Fields />
              </div>
            </Surface>
            <div style={{ background: 'var(--env-color-bg-popup)', padding: '1rem' }}>
              <div data-testid={`${theme}-popup`}>
                <Fields />
              </div>
            </div>
          </Column>
        </Theme>
      ))}
    </Column>
  );
}
