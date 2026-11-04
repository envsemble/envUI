import { useId, useState } from 'react';
import { Button, Column, Menu, Text } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconGroups3 } from '@envsemble/envui/icons/Groups3';
import { IconUnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

const organizations = [
  { id: 'northwind', label: 'Northwind Labs', role: 'Admin' },
  { id: 'contoso', label: 'Contoso', role: 'Member' },
  { id: 'fabrikam', label: 'Fabrikam Research and Development', role: 'Member' },
];

export default function SwitchOrganization() {
  const [current, setCurrent] = useState('northwind');
  const [message, setMessage] = useState('');
  const headingId = useId();
  const active = organizations.find(({ id }) => id === current);
  return (
    // As wide as a NavigationDrawer's header.
    <Column gap={4} align="start" style={{ inlineSize: 'min(100%, 14rem)' }}>
      <Menu.Root
        aria-label="Organizations"
        align="start"
        trigger={
          // The trigger names the active organization.
          <Button variant="secondary" endIcon={<IconUnfoldMore />}>
            {active?.label}
          </Button>
        }
      >
        {/* The first row: the groups icon above the heading that names the organizations. */}
        <Menu.Header>
          <Column align="center" gap={2} padding={3}>
            <IconGroups3 width="2rem" height="2rem" />
            <Text variant="headline" id={headingId}>
              Organizations
            </Text>
          </Column>
        </Menu.Header>
        <Menu.RadioGroup
          aria-labelledby={headingId}
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
        <Menu.Item icon={<IconAdd />} onClick={() => setMessage('Create organization chosen')}>
          Create organization
        </Menu.Item>
      </Menu.Root>
      <Text variant="body-sm" role="status">
        {message}
      </Text>
    </Column>
  );
}
