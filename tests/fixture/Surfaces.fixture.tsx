import {
  Badge,
  Button,
  List,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Theme,
  type ColorScheme,
  type ThemeSurface,
} from '@envsemble/envui';
import { IconComputer } from '@envsemble/envui/icons/Computer';
import { IconSmartphone } from '@envsemble/envui/icons/Smartphone';

export const mount = 'root';

const channels = [
  { value: 'stable', label: 'Stable' },
  { value: 'nightly', label: 'Nightly' },
];

export default function SurfacesFixture() {
  const query = new URLSearchParams(location.search);
  const surface: ThemeSurface = query.get('surface') === 'filled' ? 'filled' : 'plain';
  const theme: ColorScheme = query.get('theme') === 'dark' ? 'dark' : 'light';
  return (
    <Theme theme={theme} surface={surface}>
      <div
        data-surfaces={`${surface}-${theme}`}
        style={{
          display: 'grid',
          gap: '2rem',
          inlineSize: '36rem',
          padding: '1.5rem',
          background: 'var(--env-color-bg-page)',
        }}
      >
        <List.Root title="Remote access" description="Let your other devices reach this computer.">
          <List.Item
            label="Allow paired devices"
            description="They can see and steer the agents on this computer."
            control={<Switch defaultChecked />}
          />
          <List.Item
            label="Port"
            description="Default 7420."
            control={<TextField defaultValue="7420" style={{ inlineSize: '8rem' }} />}
          />
          <List.Item label="Channel" control={<Select items={channels} defaultValue="stable" />} />
        </List.Root>
        <RadioGroup orientation="vertical" label="Reach this computer via" defaultValue="tailscale">
          <Radio value="local" label="Local network" description="192.168.1.20" />
          <Radio value="tailscale" label="Tailscale" description="100.64.0.7" />
          <Radio value="loopback" label="This computer only" description="127.0.0.1" />
        </RadioGroup>
        <List.Root title="Paired devices">
          <List.Item
            start={<IconSmartphone />}
            label="Phone"
            description="Paired 3 days ago"
            end={<Button variant="outline">Remove…</Button>}
          />
          <List.Item
            start={<IconComputer />}
            label="Laptop"
            description="Paired yesterday"
            end={
              <>
                <Badge tone="success">Online</Badge>
                <Button variant="secondary">Remove…</Button>
              </>
            }
          />
        </List.Root>
      </div>
    </Theme>
  );
}
