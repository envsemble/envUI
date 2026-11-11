import { useState } from 'react';
import { Breadcrumbs, Column, Link, List, PageHeader, Surface } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { outlined } from './Outline';
import type { TileWindow } from './Tiles';

const row = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) [data-row-target]`;
const level = (index: number) =>
  `.env-breadcrumbs-item:nth-child(${index}) > .env-breadcrumbs-link`;

/** Goes down into Files, with the trail and the title following, and back up by the trail. */
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
  Website: ['Files', 'Tasks', 'Members'],
  Files: ['Brand guide', 'Sitemap', 'Press kit'],
};

/** A tile's links lead nowhere; a choice stands in for the router. */
const stay = (event: { preventDefault: () => void }) => event.preventDefault();

/** A larger window than the tiles' (Tile.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 15, height: 11.25 };

/** A page two levels down: the trail back up, its title, and what it holds, each a link down. */
export default function NavigationTile() {
  const [path, setPath] = useState(['Projects', 'Website']);
  usePointer(script);
  const shown = path[path.length - 1];
  return (
    <Column gap={3} style={{ inlineSize: '17rem' }}>
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
      <Surface background="muted" padding={1} radius="sm" style={outlined}>
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
      </Surface>
    </Column>
  );
}
