import { useState } from 'react';
import { Avatar, AvatarButton, Column, Menu, Row, Text } from '@envsemble/envui';
import { Groups3 } from '@envsemble/envui/icons/Groups3';
import { Logout } from '@envsemble/envui/icons/Logout';

const organizations = [
  { id: 'northwind', label: 'Northwind' },
  { id: 'contoso', label: 'Contoso' },
];

export default function WithOrganizations() {
  const [organization, setOrganization] = useState('northwind');
  const current = organizations.find(({ id }) => id === organization);
  return (
    <Row justify="end">
      <Menu.Root aria-label="Account" align="end" trigger={<AvatarButton name="Sam Lee" />}>
        <Menu.Header>
          <Row align="center" gap={3}>
            <Avatar name="Sam Lee" size="lg" />
            <Column>
              <Text>Sam Lee</Text>
              <Text variant="body-sm" emphasis="muted">
                {current?.label}
              </Text>
            </Column>
          </Row>
        </Menu.Header>
        {/* A switch between the person's organizations, in a submenu of its own. */}
        <Menu.Submenu label="Organization" icon={<Groups3 />} description={current?.label}>
          <Menu.RadioGroup value={organization} onValueChange={setOrganization}>
            {organizations.map(({ id, label }) => (
              <Menu.RadioItem key={id} value={id}>
                {label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Submenu>
        <Menu.Separator />
        <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
      </Menu.Root>
    </Row>
  );
}
