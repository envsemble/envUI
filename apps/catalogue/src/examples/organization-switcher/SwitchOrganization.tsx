import { useState } from 'react';
import { Button, Column, Menu, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { UnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

const organizations = [
  { id: 'northwind', label: 'Northwind Labs', role: 'Admin' },
  { id: 'contoso', label: 'Contoso', role: 'Member' },
  { id: 'fabrikam', label: 'Fabrikam Research and Development', role: 'Member' },
];

export default function SwitchOrganization() {
  const [current, setCurrent] = useState('northwind');
  const [message, setMessage] = useState('');
  const active = organizations.find(({ id }) => id === current);
  return (
    // As wide as a navigation Drawer's header.
    <Column gap={4} align="start" style={{ inlineSize: 'min(100%, 14rem)' }}>
      <Menu.Root
        aria-label="Organizations"
        align="start"
        trigger={
          // The trigger names the active organization.
          <Button variant="secondary" endIcon={<UnfoldMore />}>
            {active?.label}
          </Button>
        }
      >
        <Menu.RadioGroup
          label="Organizations"
          value={current}
          onValueChange={(id) => {
            setCurrent(id);
            setMessage(`Switched to ${organizations.find((each) => each.id === id)?.label}`);
          }}
        >
          {organizations.map(({ id, label, role }) => (
            <Menu.RadioItem key={id} value={id} description={role}>
              {label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.Item icon={<Add />} onClick={() => setMessage('Create organization chosen')}>
          Create organization
        </Menu.Item>
      </Menu.Root>
      <Text variant="body-sm" role="status">
        {message}
      </Text>
    </Column>
  );
}
