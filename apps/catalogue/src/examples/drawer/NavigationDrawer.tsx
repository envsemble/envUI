import { useState } from 'react';
import { Button, Drawer, Link, Column, Text } from '@envsemble/envui';
import { Menu } from '@envsemble/envui/icons/Menu';

const sections = ['Overview', 'Projects', 'People', 'Settings'];

export default function NavigationDrawer() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('Overview');
  return (
    <Column gap={3} align="start">
      <Drawer
        side="start"
        aria-label="Navigation"
        width="min(18rem, 100vw - 2rem)"
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="secondary" startIcon={<Menu />}>
            Menu
          </Button>
        }
      >
        <nav aria-label="Sections">
          <Column gap={3}>
            {sections.map((section) => (
              <Link
                key={section}
                href={`#${section.toLowerCase()}`}
                aria-current={section === current ? 'page' : undefined}
                onClick={(event) => {
                  // A choice closes the drawer; the application routes.
                  event.preventDefault();
                  setCurrent(section);
                  setOpen(false);
                }}
              >
                {section}
              </Link>
            ))}
          </Column>
        </nav>
      </Drawer>
      <Text>Showing {current}.</Text>
    </Column>
  );
}
