import { useState } from 'react';
import { Avatar, Link, List } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

const people = [
  { id: 'alex', name: 'Alex Morgan', role: 'Design' },
  { id: 'sam', name: 'Sam Lee', role: 'Engineering' },
  { id: 'priya', name: 'Priya Shah', role: 'Product' },
];

const row = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) [data-row-target]`;

const script: PointerStep[] = [
  { wait: 180 },
  { to: row(1), x: 0.5 },
  { wait: 240 },
  { click: true },
  { wait: 720 },
  { to: row(2), x: 0.5, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 300 },
];

export const tileWindow: TileWindow = { width: 16, height: 12 };

export default function ListTile() {
  const [current, setCurrent] = useState('sam');
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  return (
    <List.Root aria-label="People" style={{ inlineSize: narrow ? '10rem' : '12rem' }}>
      {(narrow ? people.slice(0, 2) : people).map(({ id, name, role }) => (
        <List.Item
          key={id}
          interactive
          current={id === current}
          start={<Avatar name={name} size="sm" />}
          label={
            <Link
              href={`/people/${id}`}
              underline={false}
              data-row-target
              draggable={false}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(id);
              }}
            >
              {name}
            </Link>
          }
          description={role}
        />
      ))}
    </List.Root>
  );
}
