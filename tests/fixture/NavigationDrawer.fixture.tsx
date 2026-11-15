import { useState, type ReactNode } from 'react';
import {
  Badge,
  IconButton,
  NavigationDrawer,
  type NavigationDrawerDestination,
} from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';

export const mount = 'standalone';

const destinations: NavigationDrawerDestination[] = [
  { label: 'Inbox', href: '#inbox', current: true },
  { label: 'Drafts', href: '#drafts' },
  { label: 'Archive', href: '#archive' },
];

const longDestinations: NavigationDrawerDestination[] = [
  { label: 'Inbox', href: '#inbox', group: 'Shared across the organization', current: true },
  {
    label: 'Reviews waiting for the whole team',
    href: '#reviews',
    group: 'Shared across the organization',
  },
];

const sections: NavigationDrawerDestination[] = [
  { label: 'Profile', href: '#profile', current: true },
  { label: 'Notifications and e-mail', href: '#notifications', badge: <Badge>New</Badge> },
  {
    label: 'Saved search',
    href: '#saved',
    end: (
      <IconButton
        icon={<IconDelete />}
        aria-label="Delete Saved search"
        size="sm"
        variant="ghost"
      />
    ),
  },
];

function Frame({ width, dir, children }: { width: string; dir?: 'rtl'; children: ReactNode }) {
  return (
    <div
      dir={dir}
      style={{
        containerType: 'inline-size',
        display: 'flex',
        inlineSize: width,
        blockSize: '12rem',
        outline: '1px dashed',
      }}
    >
      {children}
      <div style={{ flex: 1 }}>Content</div>
    </div>
  );
}

export default function NavigationDrawerFixture() {
  const [width, setWidth] = useState(20);
  const [committed, setCommitted] = useState<number>();
  return (
    <div className="fixture-section" style={{ display: 'grid', gap: '1rem' }}>
      <Frame width="64rem">
        <NavigationDrawer aria-label="Own width" destinations={destinations} resizable />
      </Frame>
      <Frame width="48rem">
        <NavigationDrawer
          aria-label="Controlled"
          destinations={destinations}
          resizable
          width={width}
          onWidthChange={(next, details) => {
            setWidth(next);
            if (details.committed) setCommitted(next);
          }}
          resizeLabel="Resize mail"
        />
      </Frame>
      <output data-testid="width">{width}</output>
      <output data-testid="committed">{committed ?? ''}</output>
      <Frame width="64rem" dir="rtl">
        <NavigationDrawer aria-label="Right to left" destinations={destinations} resizable />
      </Frame>
      <Frame width="64rem">
        <NavigationDrawer aria-label="Fixed" destinations={destinations} />
      </Frame>
      <Frame width="64rem">
        <NavigationDrawer
          aria-label="Long labels"
          destinations={longDestinations}
          resizable
          defaultWidth={22}
          minWidth={10}
        />
      </Frame>
      <div
        data-testid="narrow-column"
        style={{ display: 'grid', gridTemplateColumns: '12rem 1fr', blockSize: '12rem' }}
      >
        <NavigationDrawer aria-label="Sections" destinations={sections} />
        <div>Content</div>
      </div>
    </div>
  );
}
