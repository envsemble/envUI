import { useState } from 'react';
import { OrganizationSwitcher, Column, Text } from '@envsemble/envui';

const organizations = [
  { id: 'northwind', label: 'Northwind Labs', description: 'Admin' },
  { id: 'contoso', label: 'Contoso', description: 'Member' },
  { id: 'fabrikam', label: 'Fabrikam Research and Development', description: 'Member' },
];

export default function SwitchOrganization() {
  const [currentId, setCurrentId] = useState<string | null>('northwind');
  const [message, setMessage] = useState('');
  return (
    // As wide as a navigation Drawer's header.
    <Column gap={4} align="start" style={{ inlineSize: 'min(100%, 14rem)' }}>
      <OrganizationSwitcher
        items={organizations}
        value={currentId}
        onValueChange={(id: string) => {
          setCurrentId(id);
          setMessage(`Switched to ${organizations.find((item) => item.id === id)?.label}`);
        }}
        onCreate={() => setMessage('Create organization chosen')}
      />
      <Text variant="body-sm" role="status">
        {message}
      </Text>
    </Column>
  );
}
