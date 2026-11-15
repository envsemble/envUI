import {
  Checkbox,
  List,
  Radio,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Slider,
  Switch,
  Theme,
} from '@envsemble/envui';

export const mount = 'standalone';

export default function RowControlsFixture() {
  return (
    <Theme theme="light" className="fixture-section">
      <List.Root title="Row controls">
        <List.Item
          label="Sync"
          description="Keep this computer in step."
          control={<Checkbox defaultChecked />}
        />
        <List.Item
          label="Channel"
          description="Where updates come from."
          control={
            <RadioGroup defaultValue="stable">
              <Radio value="stable" label="Stable" />
              <Radio value="nightly" label="Nightly" />
            </RadioGroup>
          }
        />
        <List.Item
          label="Density"
          control={
            <SegmentedControl
              items={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Comfortable' },
              ]}
            />
          }
        />
        <List.Item label="Volume" description="Of every sound." control={<Slider />} />
        <List.Item label="Filter" control={<SearchField />} />
        <List.Item label="Alerts" control={<Switch label="Mute alerts" />} />
      </List.Root>
    </Theme>
  );
}
