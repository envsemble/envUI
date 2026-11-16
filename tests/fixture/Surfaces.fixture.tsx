import {
  Badge,
  Checkbox,
  IconButton,
  List,
  Radio,
  RadioGroup,
  Switch,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';
import { IconComputer } from '@envsemble/envui/icons/Computer';
import { IconMoreHoriz } from '@envsemble/envui/icons/MoreHoriz';
import { IconSmartphone } from '@envsemble/envui/icons/Smartphone';

export const mount = 'root';

export default function SurfacesFixture() {
  const query = new URLSearchParams(location.search);
  const theme: ColorScheme = query.get('theme') === 'dark' ? 'dark' : 'light';
  return (
    <Theme theme={theme}>
      <div
        data-surfaces={theme}
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
          <List.Item label="Wake this computer for them" control={<Checkbox />} />
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
            end={<IconButton variant="text" icon={<IconMoreHoriz />} aria-label="More for Phone" />}
          />
          <List.Item
            start={<IconComputer />}
            label="Laptop"
            description="Paired yesterday"
            end={
              <>
                <Badge tone="success">Online</Badge>
                <IconButton variant="text" icon={<IconMoreHoriz />} aria-label="More for Laptop" />
              </>
            }
          />
        </List.Root>
      </div>
    </Theme>
  );
}
