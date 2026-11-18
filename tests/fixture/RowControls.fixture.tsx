import { Checkbox, List, Switch, Theme } from '@envsemble/envui';

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
        <List.Item label="Alerts" control={<Switch label="Mute alerts" />} />
      </List.Root>
    </Theme>
  );
}
