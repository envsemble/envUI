import { useState } from 'react';
import { List, Select, Switch, TextField } from '@envsemble/envui';

const addresses = [
  { value: 'local', label: 'Local network' },
  { value: 'tailscale', label: 'Tailscale' },
  { value: 'loopback', label: 'This computer only' },
];

export default function SettingsRows() {
  const [remote, setRemote] = useState(true);
  const [port, setPort] = useState('7420');
  return (
    <List.Root title="Remote access" description="Let your other devices reach this computer.">
      <List.Item
        label="Allow paired devices"
        description="They can see and steer the agents on this computer."
        control={<Switch checked={remote} onCheckedChange={setRemote} />}
      />
      <List.Item
        label="Reach this computer via"
        control={<Select items={addresses} defaultValue="local" disabled={!remote} />}
      />
      <List.Item
        label="Port"
        description="The port other devices connect to. Default 7420."
        control={
          <TextField
            defaultValue={port}
            inputMode="numeric"
            disabled={!remote}
            onValueCommitted={setPort}
          />
        }
      />
    </List.Root>
  );
}
