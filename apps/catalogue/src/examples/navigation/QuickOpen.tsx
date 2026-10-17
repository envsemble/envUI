import { useMemo, useRef, useState } from 'react';
import {
  CommandPalette,
  PageHeader,
  SearchTrigger,
  Stack,
  type CommandPaletteItem,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Description } from '@envsemble/envui/icons/Description';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';

/** Moves focus to the page's heading, which takes focus without becoming a tab stop. */
function focusHeading(page: HTMLElement | null) {
  const heading = page?.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus();
}

export default function QuickOpen() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(destinations[0]);
  const page = useRef<HTMLDivElement>(null);

  // The application filters and ranks the destinations; here, every word of the query must match.
  const items = useMemo<CommandPaletteItem[]>(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return destinations
      .filter((destination) =>
        words.every((word) =>
          `${destination.label} ${destination.kind}`.toLowerCase().includes(word),
        ),
      )
      .map((destination) => ({
        id: destination.href,
        label: destination.label,
        icon: destination.icon,
        group: groups[destination.kind],
      }));
  }, [query]);

  return (
    <Stack ref={page} gap={4}>
      {/* Where the frame puts search: the sidebar's top, or the header's end. */}
      <Stack align="start">
        {/* The catalogue's own search keeps Ctrl+K here; an application's one trigger listens. */}
        <SearchTrigger label="Search Northwind" listen={false} onClick={() => setOpen(true)} />
      </Stack>
      <PageHeader headingLevel={3} title={current.label} description={current.description} />
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        aria-label="Search Northwind"
        placeholder="Projects, documents and people"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item) => {
          // The router opens the destination; the example keeps it in state. Once the palette
          // has closed, focus moves to the new page's heading, as after any change of page.
          const destination = destinations.find(({ href }) => href === item.id);
          if (!destination) return;
          setCurrent(destination);
          // The palette returns focus to its trigger as it closes, but only while focus is still
          // on the body or inside it; waiting a task lets that happen first, so the heading keeps
          // focus rather than losing it to the trigger.
          setTimeout(() => focusHeading(page.current));
        }}
        emptyLabel="No matching pages, projects, documents or people"
      />
    </Stack>
  );
}

const groups: Record<string, string> = {
  Page: 'Pages',
  Project: 'Projects',
  Document: 'Documents',
  Person: 'People',
};

const destinations = [
  {
    label: 'Home',
    kind: 'Page',
    href: '/',
    icon: <Home />,
    description: 'What changed in your projects since you last looked.',
  },
  {
    label: 'Website refresh',
    kind: 'Project',
    href: '/projects/website-refresh',
    icon: <Category />,
    description: 'Owned by Priya Shah. Due 27 March 2026.',
  },
  {
    label: 'Quarterly report',
    kind: 'Project',
    href: '/projects/quarterly-report',
    icon: <Category />,
    description: 'Owned by Sam Lee. Due 31 March 2026.',
  },
  {
    label: 'Launch plan',
    kind: 'Document',
    href: '/documents/launch-plan',
    icon: <Description />,
    description: 'Edited by Sam Lee on 2 March 2026.',
  },
  {
    label: 'Annual review',
    kind: 'Document',
    href: '/documents/annual-review',
    icon: <Description />,
    description: 'Edited by Alex Morgan on 26 February 2026.',
  },
  {
    label: 'Priya Shah',
    kind: 'Person',
    href: '/team/priya-shah',
    icon: <Group />,
    description: 'Design lead at Northwind.',
  },
];
