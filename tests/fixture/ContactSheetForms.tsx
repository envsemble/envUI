import {
  Avatar,
  Calendar,
  Checkbox,
  Combobox,
  DatePicker,
  DropZone,
  Field,
  MonthPicker,
  Radio,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TextField,
  Textarea,
  TimePicker,
  type ComboboxItem,
  type SelectItem,
} from '@envsemble/envui';
import { ColorPicker, ColorPickerButton, ColorSwatch } from '@envsemble/envui/color';
import { RichText, RichTextEditor } from '@envsemble/envui/rich-text';
import { IconMail } from '@envsemble/envui/icons/Mail';
import { IconVisibility } from '@envsemble/envui/icons/Visibility';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';
import { IconCalendarMonth } from '@envsemble/envui/icons/CalendarMonth';
import { IconButton } from '@envsemble/envui';
import { Cell, Section, Stage, Strip, interactionStates } from './ContactSheetParts.js';

const sizes = ['sm', 'md', 'lg'] as const;
/** sm is for a field with its label hidden, as in a toolbar: one that shows its label takes md. */
const sizeLabel = (size: (typeof sizes)[number]) =>
  size === 'sm' ? { showLabel: false, caption: 'sm, label hidden' } : { caption: size };
const fieldWidth = '15rem';

/** The states a text-like field is shown in, with the props each takes, and its error when invalid. */
function fieldStates<P extends object>(
  rest: P,
  filled: P,
  error = 'Use lowercase letters and hyphens.',
) {
  return [
    { caption: 'Empty', props: rest },
    { caption: 'Hover', props: rest, force: 'hover' as const },
    { caption: 'Focus-visible', props: filled, force: 'focus' as const },
    { caption: 'Filled', props: filled },
    { caption: 'Invalid', props: { ...filled, error } },
    { caption: 'Read-only', props: { ...filled, readOnly: true } },
    { caption: 'Disabled', props: { ...filled, disabled: true } },
  ];
}

function TextFields() {
  return (
    <Section name="TextField">
      {(['outline', 'ghost'] as const).map((variant) => (
        <Strip key={variant} label={variant}>
          {fieldStates(
            { label: 'Project name', placeholder: 'Enter a name' },
            { label: 'Project name', defaultValue: 'Northwind launch' },
          ).map(({ caption, props, force }) => (
            <Cell key={caption} caption={caption} force={force} target="input" width={fieldWidth}>
              <TextField variant={variant} {...props} />
            </Cell>
          ))}
        </Strip>
      ))}
      <Strip label="Sizes">
        {sizes.map((size) => {
          const { caption, showLabel } = sizeLabel(size);
          return (
            <Cell key={size} caption={caption} width={fieldWidth}>
              <TextField
                size={size}
                label="Project name"
                showLabel={showLabel}
                defaultValue="Northwind"
              />
            </Cell>
          );
        })}
        {sizes.map((size) => {
          const { caption, showLabel } = sizeLabel(size);
          return (
            <Cell key={`ghost-${size}`} caption={`ghost ${caption}`} width={fieldWidth}>
              <TextField
                variant="ghost"
                size={size}
                label="Project name"
                showLabel={showLabel}
                defaultValue="Northwind"
              />
            </Cell>
          );
        })}
      </Strip>
      <Strip label="Content">
        <Cell caption="Description" width={fieldWidth}>
          <TextField
            label="Email"
            description="We only send receipts."
            defaultValue="alex@example.com"
          />
        </Cell>
        <Cell caption="Prefix and suffix" width={fieldWidth}>
          <TextField label="Price" prefix="$" suffix="per month" defaultValue="12" />
        </Cell>
        <Cell caption="Start icon, end action" width={fieldWidth}>
          <TextField
            label="Password"
            type="password"
            defaultValue="hunter2hunter2"
            startIcon={<IconMail />}
            endAction={
              <IconButton variant="ghost" size="sm" icon={<IconVisibility />} aria-label="Show" />
            }
          />
        </Cell>
        <Cell caption="Label hidden (showLabel false)" width={fieldWidth}>
          <TextField label="Filter" showLabel={false} placeholder="Filter rows" />
        </Cell>
        <Cell caption="Required" width={fieldWidth}>
          <TextField label="Workspace" required placeholder="northwind" />
        </Cell>
      </Strip>
    </Section>
  );
}

function SearchFields() {
  return (
    <Section name="SearchField">
      {(['outline', 'ghost'] as const).map((variant) => (
        <Strip key={variant} label={variant}>
          {interactionStates.slice(0, 3).map(({ caption, force }) => (
            <Cell key={caption} caption={caption} force={force} target="input" width={fieldWidth}>
              <SearchField variant={variant} label="Search projects" />
            </Cell>
          ))}
          <Cell caption="Filled (clear button)" width={fieldWidth}>
            <SearchField variant={variant} label="Search projects" defaultValue="launch" />
          </Cell>
          <Cell caption="Label shown" width={fieldWidth}>
            <SearchField variant={variant} label="Search projects" showLabel />
          </Cell>
          <Cell caption="Invalid" width={fieldWidth}>
            <SearchField
              variant={variant}
              label="Search projects"
              defaultValue="**"
              error="Use words."
            />
          </Cell>
          <Cell caption="Disabled" width={fieldWidth}>
            <SearchField variant={variant} label="Search projects" disabled />
          </Cell>
          {sizes.map((size) => (
            <Cell key={size} caption={size} width={fieldWidth}>
              <SearchField variant={variant} size={size} label="Search projects" />
            </Cell>
          ))}
        </Strip>
      ))}
    </Section>
  );
}

function Textareas() {
  const notes = 'The venue is booked.\nThe press kit goes out on Monday.';
  return (
    <Section name="Textarea">
      {(['outline', 'ghost'] as const).map((variant) => (
        <Strip key={variant} label={variant}>
          {fieldStates(
            { label: 'Notes', placeholder: 'Add notes' },
            { label: 'Notes', defaultValue: notes },
            'Keep notes under 200 characters.',
          ).map(({ caption, props, force }) => (
            <Cell
              key={caption}
              caption={caption}
              force={force}
              target="textarea"
              width={fieldWidth}
            >
              <Textarea variant={variant} rows={3} {...props} />
            </Cell>
          ))}
        </Strip>
      ))}
      <Strip label="Sizing">
        <Cell caption="Fixed, 2 rows" width={fieldWidth}>
          <Textarea label="Notes" rows={2} defaultValue={`${notes}\nAnd a third line.`} />
        </Cell>
        <Cell caption="Content (grows)" width={fieldWidth}>
          <Textarea
            label="Notes"
            sizing="content"
            rows={2}
            defaultValue={`${notes}\nAnd a third line.`}
          />
        </Cell>
        <Cell caption="Description" width={fieldWidth}>
          <Textarea label="Notes" description="Visible to the team." rows={2} />
        </Cell>
      </Strip>
    </Section>
  );
}

const plans: SelectItem[] = [
  { value: 'starter', label: 'Starter', description: 'Up to 3 people' },
  { value: 'team', label: 'Team', description: 'Up to 50 people' },
  { value: 'enterprise', label: 'Enterprise (disabled)', disabled: true },
];

function Selects() {
  return (
    <Section name="Select">
      <Strip label="States">
        {fieldStates(
          { label: 'Plan', items: plans, placeholder: 'Choose a plan' },
          { label: 'Plan', items: plans, defaultValue: 'team' },
          'Team needs at least 3 seats.',
        ).map(({ caption, props, force }) => (
          <Cell key={caption} caption={caption} force={force} target="button" width={fieldWidth}>
            <Select {...props} />
          </Cell>
        ))}
      </Strip>
      <Strip label="Sizes, open">
        {sizes.map((size) => {
          const { caption, showLabel } = sizeLabel(size);
          return (
            <Cell key={size} caption={caption} width={fieldWidth}>
              <Select
                size={size}
                label="Plan"
                showLabel={showLabel}
                items={plans}
                defaultValue="starter"
              />
            </Cell>
          );
        })}
        <Cell caption="md, label hidden" width={fieldWidth}>
          <Select label="Plan" showLabel={false} items={plans} defaultValue="starter" />
        </Cell>
        <Cell caption="Open, cursor on Team" highlight="[role=option]:nth-child(2)">
          <Stage height="16rem" width="18rem">
            <Select label="Plan" items={plans} defaultValue="starter" defaultOpen />
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => ({
    value: name.toLowerCase().replace(' ', '.'),
    label: name,
    start: <Avatar name={name} />,
  }),
);
const withDisabled: ComboboxItem[] = [
  ...people.slice(0, 3),
  { value: 'kai', label: 'Kai Ito (disabled)', disabled: true },
];

function Comboboxes() {
  return (
    <Section name="Combobox">
      <Strip label="Single">
        {fieldStates(
          { label: 'Owner', items: people, placeholder: 'Choose a person' },
          { label: 'Owner', items: people, defaultValue: 'sam.lee' },
          'Choose someone on this project.',
        ).map(({ caption, props, force }) => (
          <Cell key={caption} caption={caption} force={force} target="input" width={fieldWidth}>
            <Combobox {...props} />
          </Cell>
        ))}
      </Strip>
      <Strip label="Multiple, sizes">
        <Cell caption="Multiple, clearable" width="20rem">
          <Combobox
            multiple
            clearable
            label="Reviewers"
            items={people}
            defaultValue={['sam.lee', 'priya.shah']}
          />
        </Cell>
        {sizes.map((size) => {
          const { caption, showLabel } = sizeLabel(size);
          return (
            <Cell key={size} caption={caption} width={fieldWidth}>
              <Combobox
                size={size}
                label="Owner"
                showLabel={showLabel}
                items={people}
                defaultValue="alex.morgan"
              />
            </Cell>
          );
        })}
      </Strip>
      <Strip label="Open">
        <Cell caption="Open, cursor on Sam Lee" highlight="[role=option]:nth-child(2)">
          <Stage height="18rem" width="18rem">
            <Combobox label="Owner" items={withDisabled} defaultOpen />
          </Stage>
        </Cell>
        <Cell caption="Open, multiple">
          <Stage height="18rem" width="20rem">
            <Combobox
              multiple
              label="Reviewers"
              items={people}
              defaultValue={['sam.lee']}
              defaultOpen
            />
          </Stage>
        </Cell>
        <Cell caption="Loading">
          <Stage height="10rem" width="18rem">
            <Combobox label="Owner" items={[]} loading defaultOpen />
          </Stage>
        </Cell>
        <Cell caption="No matches">
          <Stage height="10rem" width="18rem">
            <Combobox label="Owner" items={[]} defaultOpen />
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

function Choices() {
  return (
    <>
      <Section name="Checkbox">
        {(
          [
            ['Unchecked', false],
            ['Checked', true],
            ['Mixed', 'mixed'],
          ] as const
        ).map(([label, checked]) => (
          <Strip key={label} label={label}>
            {interactionStates.map(({ caption, force }) => (
              <Cell key={caption} caption={caption} force={force} target="input">
                <Checkbox label="Email me updates" defaultChecked={checked} />
              </Cell>
            ))}
            <Cell caption="Disabled">
              <Checkbox label="Email me updates" defaultChecked={checked} disabled />
            </Cell>
          </Strip>
        ))}
        <Strip label="Description">
          <Cell caption="With a description" width="18rem">
            <Checkbox label="Weekly digest" description="A summary every Monday." defaultChecked />
          </Cell>
        </Strip>
      </Section>
      <Section name="Switch">
        {(
          [
            ['Off', false],
            ['On', true],
          ] as const
        ).map(([label, checked]) => (
          <Strip key={label} label={label}>
            {interactionStates.map(({ caption, force }) => (
              <Cell key={caption} caption={caption} force={force} target="input">
                <Switch label="Notifications" defaultChecked={checked} />
              </Cell>
            ))}
            <Cell caption="Disabled">
              <Switch label="Notifications" defaultChecked={checked} disabled />
            </Cell>
          </Strip>
        ))}
        <Strip label="Description">
          <Cell caption="With a description" width="18rem">
            <Switch label="Auto-save" description="Saves every minute." defaultChecked />
          </Cell>
        </Strip>
      </Section>
      <Section name="RadioGroup and Radio">
        <Strip label="Radio states">
          {interactionStates.map(({ caption, force }) => (
            <Cell
              key={caption}
              caption={`${caption} (Weekly)`}
              force={force}
              target="input[value=weekly]"
            >
              <RadioGroup label="Frequency" defaultValue="daily">
                <Radio value="daily" label="Daily" />
                <Radio value="weekly" label="Weekly" />
              </RadioGroup>
            </Cell>
          ))}
          <Cell caption="Checked, focus-visible" force="focus" target="input[value=daily]">
            <RadioGroup label="Frequency" defaultValue="daily">
              <Radio value="daily" label="Daily" />
              <Radio value="weekly" label="Weekly" />
            </RadioGroup>
          </Cell>
        </Strip>
        <Strip label="Group">
          <Cell caption="Horizontal">
            <RadioGroup label="Visibility" orientation="horizontal" defaultValue="team">
              <Radio value="private" label="Private" />
              <Radio value="team" label="Team" />
              <Radio value="public" label="Public" />
            </RadioGroup>
          </Cell>
          <Cell caption="Descriptions" width="18rem">
            <RadioGroup label="Plan" description="Change it at any time." defaultValue="team">
              <Radio value="starter" label="Starter" description="Up to 3 people" />
              <Radio value="team" label="Team" description="Up to 50 people" />
            </RadioGroup>
          </Cell>
          <Cell caption="Invalid">
            <RadioGroup label="Region" required error="Choose a region.">
              <Radio value="eu" label="Europe" />
              <Radio value="us" label="United States" />
            </RadioGroup>
          </Cell>
          <Cell caption="Disabled">
            <RadioGroup label="Region" disabled defaultValue="eu">
              <Radio value="eu" label="Europe" />
              <Radio value="us" label="United States" />
            </RadioGroup>
          </Cell>
        </Strip>
      </Section>
    </>
  );
}

function Segments() {
  const items = [
    { value: 'list', label: 'List', icon: <IconViewList />, count: 12 },
    { value: 'board', label: 'Board', icon: <IconViewModule />, count: 4 },
    { value: 'calendar', label: 'Calendar', icon: <IconCalendarMonth />, disabled: true },
  ];
  const plain = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];
  return (
    <Section name="SegmentedControl">
      <Strip label="States of Week">
        {interactionStates.map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={caption}
            force={force}
            target="[role=radio]:nth-of-type(2), button:nth-of-type(2)"
          >
            <SegmentedControl aria-label="Range" items={plain} defaultValue="day" />
          </Cell>
        ))}
        <Cell caption="Selected, focus-visible" force="focus" target="[role=radio], button">
          <SegmentedControl aria-label="Range" items={plain} defaultValue="day" />
        </Cell>
        <Cell caption="Disabled">
          <SegmentedControl aria-label="Range" items={plain} defaultValue="day" disabled />
        </Cell>
      </Strip>
      <Strip label="Sizes, content">
        {sizes.map((size) => (
          <Cell key={size} caption={`${size}, icons and counts, Calendar disabled`}>
            <SegmentedControl aria-label="Layout" size={size} items={items} defaultValue="list" />
          </Cell>
        ))}
        <Cell caption="Full width" width="24rem">
          <SegmentedControl aria-label="Range" items={plain} defaultValue="week" fullWidth />
        </Cell>
      </Strip>
    </Section>
  );
}

function Sliders() {
  return (
    <Section name="Slider">
      <Strip>
        <Cell caption="Rest" width={fieldWidth}>
          <Slider label="Volume" defaultValue={40} />
        </Cell>
        <Cell
          caption="Hover (handle and ruler)"
          width={fieldWidth}
          highlight=".env-slider-control"
          markAs="data-handle data-ruler"
          force="hover"
          target="[role=slider], input"
        >
          <Slider label="Volume" defaultValue={40} step={10} />
        </Cell>
        <Cell
          caption="Focus-visible"
          width={fieldWidth}
          force="focus"
          target="input"
          highlight=".env-slider-control"
          markAs="data-handle"
        >
          <Slider label="Volume" defaultValue={40} />
        </Cell>
        <Cell
          caption="Pressed"
          width={fieldWidth}
          force="pressed"
          target="input"
          highlight=".env-slider-control"
          markAs="data-handle data-ruler"
        >
          <Slider label="Volume" defaultValue={40} step={10} />
        </Cell>
        <Cell caption="Description, formatted value" width={fieldWidth}>
          <Slider
            label="Opacity"
            description="Of the backdrop."
            defaultValue={0.6}
            min={0}
            max={1}
            step={0.05}
            formatValue={(value) => `${Math.round(value * 100)}%`}
          />
        </Cell>
        <Cell caption="Invalid" width={fieldWidth}>
          <Slider label="Seats" defaultValue={2} max={10} error="At least 3 seats." />
        </Cell>
        <Cell caption="Disabled" width={fieldWidth}>
          <Slider label="Volume" defaultValue={40} disabled />
        </Cell>
      </Strip>
    </Section>
  );
}

function Pickers() {
  return (
    <>
      <Section name="DatePicker">
        <Strip label="States">
          {fieldStates(
            { label: 'Due date', locale: 'en-GB', placeholder: 'Pick a date' },
            { label: 'Due date', locale: 'en-GB', defaultValue: '2026-11-20' },
            'Pick a date before the launch.',
          ).map(({ caption, props, force }) => (
            <Cell key={caption} caption={caption} force={force} target="button" width={fieldWidth}>
              <DatePicker {...props} />
            </Cell>
          ))}
        </Strip>
        <Strip label="Sizes, open">
          {sizes.map((size) => {
            const { caption, showLabel } = sizeLabel(size);
            return (
              <Cell key={size} caption={`${caption}, clearable`} width={fieldWidth}>
                <DatePicker
                  size={size}
                  label="Due date"
                  showLabel={showLabel}
                  locale="en-GB"
                  defaultValue="2026-11-20"
                  clearable
                />
              </Cell>
            );
          })}
          <Cell caption="Open, day">
            <Stage height="27rem" width="21rem">
              <DatePicker
                label="Due date"
                locale="en-GB"
                defaultValue="2026-11-20"
                clearable
                defaultOpen
              />
            </Stage>
          </Cell>
          <Cell caption="Open, minute granularity">
            <Stage height="30rem" width="29rem">
              <DatePicker
                label="Starts"
                locale="en-GB"
                granularity="minute"
                defaultValue="2026-11-20T09:30"
                clearable
                defaultOpen
              />
            </Stage>
          </Cell>
        </Strip>
      </Section>
      <Section name="Calendar">
        <Strip>
          <Cell caption="Value, min and max" width="18rem">
            <Calendar defaultValue="2026-11-20" min="2026-11-05" max="2026-11-27" locale="en-GB" />
          </Cell>
          <Cell
            caption="12th hovered"
            force="hover"
            target="td[data-date='2026-11-12']"
            width="18rem"
          >
            <Calendar defaultValue="2026-11-20" locale="en-GB" />
          </Cell>
          <Cell
            caption="Selected day, focus-visible"
            force="focus"
            target="td[data-date='2026-11-20']"
            width="18rem"
          >
            <Calendar defaultValue="2026-11-20" locale="en-GB" />
          </Cell>
        </Strip>
      </Section>
      <Section name="TimePicker">
        <Strip>
          {fieldStates(
            { label: 'Start', locale: 'en-GB', placeholder: 'Pick a time' },
            { label: 'Start', locale: 'en-GB', defaultValue: '09:30' },
            'Start within office hours, 10:00 to 18:00.',
          ).map(({ caption, props, force }) => (
            <Cell key={caption} caption={caption} force={force} target="button" width={fieldWidth}>
              <TimePicker {...props} />
            </Cell>
          ))}
          <Cell caption="Open, 15-minute steps">
            <Stage height="22rem" width="18rem">
              <TimePicker
                label="Start"
                locale="en-GB"
                defaultValue="09:30"
                minuteStep={15}
                clearable
                defaultOpen
              />
            </Stage>
          </Cell>
        </Strip>
      </Section>
      <Section name="MonthPicker">
        <Strip>
          {fieldStates(
            { label: 'Billing month', locale: 'en-GB', placeholder: 'Pick a month' },
            { label: 'Billing month', locale: 'en-GB', defaultValue: '2026-11' },
            'That month is billed already.',
          ).map(({ caption, props, force }) => (
            <Cell key={caption} caption={caption} force={force} target="button" width={fieldWidth}>
              <MonthPicker {...props} />
            </Cell>
          ))}
          <Cell caption="Open">
            <Stage height="20rem" width="20rem">
              <MonthPicker
                label="Billing month"
                locale="en-GB"
                defaultValue="2026-11"
                clearable
                defaultOpen
              />
            </Stage>
          </Cell>
        </Strip>
      </Section>
    </>
  );
}

function Colors() {
  const swatches = ['#1d4ed8', '#0d9488', '#ca8a04', '#dc2626', '#7c3aed'].map((color) => ({
    color,
    label: color,
  }));
  return (
    <Section name="ColorPicker, ColorPickerButton, ColorSwatch">
      <Strip label="ColorPicker">
        <Cell caption="Swatches, copyable">
          <ColorPicker label="Brand color" defaultValue="#1d4ed8" swatches={swatches} copyable />
        </Cell>
        <Cell caption="Alpha, RGB">
          <ColorPicker label="Overlay" defaultValue="#0d948880" alpha valueFormat="rgb" />
        </Cell>
        <Cell caption="Invalid">
          <ColorPicker label="Brand color" defaultValue="#ffffff" error="Too light on white." />
        </Cell>
        <Cell caption="Read-only">
          <ColorPicker label="Brand color" defaultValue="#1d4ed8" readOnly />
        </Cell>
        <Cell caption="Disabled">
          <ColorPicker label="Brand color" defaultValue="#1d4ed8" disabled />
        </Cell>
      </Strip>
      <Strip label="ColorPickerButton">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force}>
            <ColorPickerButton label="Label color" defaultValue="#0d9488" />
          </Cell>
        ))}
        {sizes.map((size) => (
          <Cell key={size} caption={size}>
            <ColorPickerButton size={size} label="Label color" defaultValue="#0d9488" />
          </Cell>
        ))}
        <Cell caption="Disabled">
          <ColorPickerButton label="Label color" defaultValue="#0d9488" disabled />
        </Cell>
        <Cell caption="Open">
          <Stage height="26rem" width="20rem">
            <ColorPickerButton
              label="Label color"
              defaultValue="#0d9488"
              swatches={swatches}
              defaultOpen
            />
          </Stage>
        </Cell>
      </Strip>
      <Strip label="ColorSwatch">
        <Cell caption="md, hex">
          <ColorSwatch color="#1d4ed8" />
        </Cell>
        <Cell caption="sm">
          <ColorSwatch color="#1d4ed8" size="sm" />
        </Cell>
        <Cell caption="Labelled">
          <ColorSwatch color="#0d9488" label="Teal" />
        </Cell>
        <Cell caption="RGB">
          <ColorSwatch color="#ca8a04" format="rgb" />
        </Cell>
        <Cell caption="HSL, with alpha">
          <ColorSwatch color="#dc262680" format="hsl" />
        </Cell>
      </Strip>
    </Section>
  );
}

function Drops() {
  return (
    <Section name="DropZone">
      {(['md', 'sm'] as const).map((size) => (
        <Strip key={size} label={size}>
          {interactionStates.slice(0, 3).map(({ caption, force }) => (
            <Cell
              key={caption}
              caption={caption}
              force={force}
              target="button, input"
              width="18rem"
            >
              <DropZone
                size={size}
                label="Drop files here"
                description="PNG or PDF, up to 10 MB."
                onFilesAccepted={() => {}}
              />
            </Cell>
          ))}
          <Cell
            caption="Dragging over"
            width="18rem"
            highlight=".env-drop-zone"
            markAs="data-drag-over"
          >
            <DropZone size={size} label="Drop files here" onFilesAccepted={() => {}} />
          </Cell>
          <Cell caption="Pending" width="18rem">
            <DropZone size={size} label="Drop files here" pending onFilesAccepted={() => {}} />
          </Cell>
          <Cell caption="Invalid" width="18rem">
            <DropZone
              size={size}
              label="Drop files here"
              error="That file is over 10 MB."
              onFilesAccepted={() => {}}
            />
          </Cell>
          <Cell caption="Disabled" width="18rem">
            <DropZone size={size} label="Drop files here" disabled onFilesAccepted={() => {}} />
          </Cell>
        </Strip>
      ))}
    </Section>
  );
}

function Fields() {
  return (
    <Section name="Field">
      <Strip>
        <Cell caption="Label, control, description" width={fieldWidth}>
          <Field.Root name="handle">
            <Field.Label>Workspace address</Field.Label>
            <Field.Control defaultValue="northwind" />
            <Field.Description>Shown in links.</Field.Description>
          </Field.Root>
        </Cell>
        <Cell caption="Focus-visible" force="focus" target="input" width={fieldWidth}>
          <Field.Root name="handle">
            <Field.Label>Workspace address</Field.Label>
            <Field.Control defaultValue="northwind" />
          </Field.Root>
        </Cell>
        <Cell caption="Invalid, error" width={fieldWidth}>
          <Field.Root name="handle" invalid>
            <Field.Label>Workspace address</Field.Label>
            <Field.Control defaultValue="Northwind Team" />
            <Field.Error match>Use lowercase letters and hyphens.</Field.Error>
          </Field.Root>
        </Cell>
        <Cell caption="Disabled" width={fieldWidth}>
          <Field.Root name="handle" disabled>
            <Field.Label>Workspace address</Field.Label>
            <Field.Control defaultValue="northwind" />
          </Field.Root>
        </Cell>
        {sizes.map((size) => (
          <Cell key={size} caption={`Control ${size}`} width={fieldWidth}>
            <Field.Root name={`handle-${size}`}>
              <Field.Label>Address</Field.Label>
              <Field.Control size={size} defaultValue="northwind" />
            </Field.Root>
          </Cell>
        ))}
      </Strip>
    </Section>
  );
}

const notes = `
[reference id="person%3Apriya" label="Priya%20Shah" kind="person" mentionSuggestionChar="%40"]
sends the **press kit**, with _quotes_ and a [link](https://example.com).

- [x] Book the venue
- [ ] Print the badges`;

function RichTexts() {
  return (
    <Section name="RichTextEditor and RichText">
      <Strip label="Editor">
        <Cell caption="Outline" width="22rem">
          <RichTextEditor
            label="Meeting notes"
            description="Shared with the launch team."
            defaultValue={notes}
          />
        </Cell>
        <Cell caption="Focus-visible" width="22rem" force="focus" target="[contenteditable=true]">
          <RichTextEditor
            label="Meeting notes"
            defaultValue={notes}
            toolbar={['bold', 'italic', 'link']}
          />
        </Cell>
        <Cell caption="Ghost, placeholder" width="22rem">
          <RichTextEditor label="Meeting notes" variant="ghost" placeholder="Write notes…" />
        </Cell>
        <Cell caption="Invalid" width="22rem">
          <RichTextEditor
            label="Summary"
            defaultValue="Too short."
            error="Write at least 50 characters."
            toolbar={['bold', 'italic']}
          />
        </Cell>
        <Cell caption="Read-only" width="22rem">
          <RichTextEditor label="Meeting notes" defaultValue={notes} readOnly />
        </Cell>
        <Cell caption="Disabled" width="22rem">
          <RichTextEditor label="Meeting notes" defaultValue={notes} disabled />
        </Cell>
      </Strip>
      <Strip label="RichText">
        <Cell caption="Rendered" width="22rem">
          <RichText>{notes}</RichText>
        </Cell>
      </Strip>
    </Section>
  );
}

export function FormsSheet() {
  return (
    <>
      <TextFields />
      <SearchFields />
      <Textareas />
      <Selects />
      <Comboboxes />
      <Choices />
      <Segments />
      <Sliders />
      <Pickers />
      <Colors />
      <Drops />
      <Fields />
      <RichTexts />
    </>
  );
}
