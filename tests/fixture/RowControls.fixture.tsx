import {
  Calendar,
  Checkbox,
  Combobox,
  DatePicker,
  List,
  Radio,
  RadioGroup,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Textarea,
  TextField,
  Theme,
} from '@envsemble/envui';

export const mount = 'standalone';

const themes = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function RowControlsFixture() {
  return (
    <Theme theme="light" className="fixture-section">
      <List.Root title="Row controls">
        <List.Item
          label="Sync"
          description="Keep this computer in step."
          control={<Checkbox defaultChecked />}
        />
        <List.Item label="Alerts" control={<Switch label="Mute alerts" />} />
      </List.Root>
      <List.Root title="Row fields">
        <List.Item
          label="Theme"
          description="Follows the system until set."
          control={<Select items={themes} defaultValue="system" />}
        />
        <List.Item
          label="Density"
          description="How tight the rows sit."
          control={
            <SegmentedControl
              items={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Comfortable' },
              ]}
            />
          }
        />
        <List.Item
          label="Volume"
          description="Of the alert sound."
          control={<Slider defaultValue={40} />}
        />
        <List.Item label="Port" description="Between 1024 and 65535." control={<TextField />} />
        <List.Item label="Notes" description="Shown to the team." control={<Textarea />} />
        <List.Item
          label="Owner"
          description="Who gets the alerts."
          control={<Combobox items={themes} />}
        />
        <List.Item
          label="Plan"
          description="Billed monthly."
          control={
            <RadioGroup orientation="horizontal">
              <Radio value="free" label="Free" />
              <Radio value="team" label="Team" />
            </RadioGroup>
          }
        />
        <List.Item label="Starts" description="The first day." control={<DatePicker />} />
        <List.Item label="Due" description="The last day." control={<Calendar />} />
        <List.Item
          label="Region"
          description="Where the data lives."
          control={<Select label="Data region" items={themes} aria-describedby="region-note" />}
        />
      </List.Root>
      <p id="region-note">Changes take a day.</p>
    </Theme>
  );
}
