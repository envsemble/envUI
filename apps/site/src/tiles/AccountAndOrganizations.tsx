import { useState } from 'react';
import { AvatarButton, Button, Menu, TopBar } from '@envsemble/envui';
import { IconUnfoldMore } from '@envsemble/envui/icons/UnfoldMore';
import { usePointer, type PointerStep } from '../motion/Motion';

const organizations = [
  { id: 'northwind', label: 'Northwind Labs', role: 'Admin' },
  { id: 'contoso', label: 'Contoso', role: 'Member' },
];

const organization = (index: number) => `.env-menu-choice:nth-child(${index} of .env-menu-choice)`;
const switcher = '.env-top-bar .env-button';

/*
 * Contoso chosen from the open switcher, which closes it and names Contoso in the bar; opened
 * again, Northwind Labs chosen back, and opened once more, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: organization(1), x: 0.4 },
  { wait: 300 },
  { to: organization(2), x: 0.4, duration: 350 },
  { wait: 400 },
  { click: true },
  { wait: 600 },
  { to: switcher, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: organization(1), x: 0.4, duration: 400 },
  { wait: 400 },
  { click: true },
  { wait: 600 },
  { to: switcher, duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/**
 * A top bar with the active organization's switcher at its start, open, and the signed-in person's
 * avatar at its end.
 */
export default function AccountAndOrganizationsTile() {
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState('northwind');
  usePointer(script, {
    onRest: () => {
      setCurrent('northwind');
      setOpen(true);
    },
  });
  const active = organizations.find(({ id }) => id === current);
  return (
    <TopBar
      style={{ inlineSize: '17rem' }}
      start={
        <Menu.Root
          aria-label="Organizations"
          align="start"
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button variant="secondary" endIcon={<IconUnfoldMore />}>
              {active?.label}
            </Button>
          }
        >
          <Menu.RadioGroup label="Organizations" value={current} onValueChange={setCurrent}>
            {organizations.map(({ id, label, role }) => (
              <Menu.RadioItem key={id} value={id} description={role}>
                {label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Root>
      }
      actions={<AvatarButton name="Sam Lee" description="sam.lee@example.com" />}
    />
  );
}
