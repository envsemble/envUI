import { useState } from 'react';
import { Button, Menu } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { UnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

interface Organization {
  id: string;
  label: string;
}

export default function FirstOrganization() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  // An application asks for the name first; here the new organization is Northwind Labs.
  const create = () => {
    setOrganizations([{ id: 'northwind', label: 'Northwind Labs' }]);
    setCurrent('northwind');
  };
  return (
    // As wide as a navigation Drawer's header.
    <div style={{ inlineSize: 'min(100%, 14rem)' }}>
      {organizations.length === 0 ? (
        // Before the first organization, the switcher is only the create action.
        <Button variant="secondary" startIcon={<Add />} onClick={create}>
          Create organization
        </Button>
      ) : (
        <Menu.Root
          aria-label="Organizations"
          align="start"
          trigger={
            <Button variant="secondary" endIcon={<UnfoldMore />}>
              {organizations.find(({ id }) => id === current)?.label}
            </Button>
          }
        >
          <Menu.RadioGroup label="Organizations" value={current} onValueChange={setCurrent}>
            {organizations.map(({ id, label }) => (
              <Menu.RadioItem key={id} value={id}>
                {label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Root>
      )}
    </div>
  );
}
