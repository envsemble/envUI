import { useState } from 'react';
import { OrganizationSwitcher, type OrganizationSwitcherItem } from '@envsemble/envui';

export default function FirstOrganization() {
  const [organizations, setOrganizations] = useState<OrganizationSwitcherItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  return (
    // As wide as a navigation Drawer's header.
    <div style={{ inlineSize: 'min(100%, 14rem)' }}>
      <OrganizationSwitcher
        items={organizations}
        value={currentId}
        onValueChange={setCurrentId}
        // An application asks for the name first; here the new organization is Northwind Labs.
        onCreate={() => {
          setOrganizations([{ id: 'northwind', label: 'Northwind Labs', description: 'Owner' }]);
          setCurrentId('northwind');
        }}
      />
    </div>
  );
}
