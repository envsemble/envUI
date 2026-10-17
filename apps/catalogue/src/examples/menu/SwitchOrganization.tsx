import { useState } from 'react';
import { OrganizationSwitcher, Stack, Text } from '@envsemble/envui';

const organizations = [
  { id: 'northwind', name: 'Northwind Labs', description: 'Admin' },
  { id: 'contoso', name: 'Contoso', description: 'Member' },
  { id: 'fabrikam', name: 'Fabrikam Research and Development', description: 'Member' },
];

export default function SwitchOrganization() {
  const [currentId, setCurrentId] = useState<string | null>('northwind');
  const [message, setMessage] = useState('');
  return (
    // As wide as the context area of an application shell's sidebar.
    <Stack align="start" style={{ inlineSize: 'min(100%, 14rem)' }}>
      <OrganizationSwitcher
        items={organizations}
        value={currentId}
        onValueChange={(id: string) => {
          setCurrentId(id);
          setMessage(`Switched to ${organizations.find((item) => item.id === id)?.name}`);
        }}
        onCreate={() => setMessage('Create organization chosen')}
      />
      <Text variant="body-sm" role="status">
        {message}
      </Text>
    </Stack>
  );
}
