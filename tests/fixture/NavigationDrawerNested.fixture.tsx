import { useState } from 'react';
import { NavigationDrawer, type NavigationDrawerDestination } from '@envsemble/envui';

export const mount = 'standalone';

/** A guide's pages, some nested under others, two levels deep; a section without href is a heading. */
interface Page {
  label: string;
  href?: string;
  group?: string;
  children?: Page[];
}

const guide: Page[] = [
  { label: 'Overview', href: '#overview', group: 'Getting started' },
  {
    label: 'Sign-in',
    href: '#sign-in',
    group: 'Getting started',
    children: [
      { label: 'Passwords', href: '#passwords' },
      { label: 'Passkeys', href: '#passkeys' },
    ],
  },
  {
    label: 'Billing',
    group: 'Account',
    children: [
      { label: 'Plans', href: '#plans' },
      { label: 'Invoices', href: '#invoices' },
    ],
  },
  {
    label: 'Integrations',
    group: 'Account',
    children: [
      {
        label: 'Webhooks',
        href: '#webhooks',
        children: [
          { label: 'Events', href: '#events' },
          { label: 'Retries', href: '#retries' },
        ],
      },
    ],
  },
];

/** The pages as destinations, the one at current marked, each choosing itself as a router would. */
function destinationsOf(pages: Page[], current: string, choose: (href: string) => void) {
  return pages.map((page): NavigationDrawerDestination => {
    const children = page.children && destinationsOf(page.children, current, choose);
    if (page.href === undefined)
      return { label: page.label, group: page.group, children: children! };
    const href = page.href;
    return {
      label: page.label,
      group: page.group,
      href,
      current: href === current,
      onClick: () => choose(href),
      children,
    };
  });
}

/**
 * Drawers with nested sections: one that keeps its own open sections, its current page in a
 * section, with a button that moves the current page into a closed one; one whose open sections the
 * application keeps.
 */
export default function NavigationDrawerNestedFixture() {
  const [current, setCurrent] = useState('#passkeys');
  const [controlledCurrent, setControlledCurrent] = useState('#overview');
  const [expanded, setExpanded] = useState<string[]>([]);
  return (
    <div className="fixture-section" style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
      <div>
        <NavigationDrawer
          aria-label="Guide"
          destinations={destinationsOf(guide, current, setCurrent)}
        />
        <button type="button" onClick={() => setCurrent('#invoices')}>
          Go to invoices
        </button>
        <p data-testid="current">{current}</p>
      </div>
      <div>
        <NavigationDrawer
          aria-label="Controlled"
          destinations={destinationsOf(guide, controlledCurrent, setControlledCurrent)}
          expanded={expanded}
          onExpandedChange={setExpanded}
        />
        <button type="button" onClick={() => setControlledCurrent('#retries')}>
          Go to retries
        </button>
        <p data-testid="expanded">{expanded.join(', ')}</p>
      </div>
    </div>
  );
}
