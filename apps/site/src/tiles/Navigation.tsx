import { useState } from 'react';
import { Breadcrumbs, Column, Link, List, PageHeader } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const row = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) [data-row-target]`;
const level = (index: number) =>
  `.env-breadcrumbs-item:nth-child(${index}) > .env-breadcrumbs-link`;

/** Down into Files, the trail and the title following, and back up by the trail. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: row(1) },
  { wait: 400 },
  { click: true },
  { wait: 1500 },
  { to: level(2), y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/** What each level holds. */
const contents: Record<string, string[]> = {
  Website: ['Files', 'Tasks'],
  Files: ['Brand guide', 'Sitemap'],
};

/** A tile's links lead nowhere; a choice stands in for the router. */
const stay = (event: { preventDefault: () => void }) => event.preventDefault();

/** A page two levels down: the trail back up, its title, and what it holds, each a way down. */
export default function NavigationTile() {
  const [path, setPath] = useState(['Projects', 'Website']);
  usePointer(script);
  const shown = path[path.length - 1];
  return (
    <Column gap={3} style={{ inlineSize: '14rem' }}>
      <PageHeader
        headingLevel={3}
        title={shown}
        breadcrumbs={
          <Breadcrumbs
            wrap={false}
            items={path.map((name, index) =>
              index === path.length - 1
                ? { label: name }
                : {
                    label: name,
                    href: '/',
                    onClick: (event) => {
                      stay(event);
                      setPath(path.slice(0, index + 1));
                    },
                  },
            )}
          />
        }
      />
      <List.Root aria-label={`In ${shown}`} density="sm">
        {contents[shown].map((name) => (
          <List.Item
            key={name}
            interactive
            label={
              <Link
                href="/"
                underline={false}
                data-row-target
                draggable={false}
                onClick={(event) => {
                  stay(event);
                  setPath([...path, name]);
                }}
              >
                {name}
              </Link>
            }
          />
        ))}
      </List.Root>
    </Column>
  );
}
