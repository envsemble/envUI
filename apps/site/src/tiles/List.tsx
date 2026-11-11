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

/*
 * A row's link, which covers the row with a pseudo-element, so a press anywhere on the row follows
 * it. The virtual pointer aims at the link itself, since it finds elements, not pseudo-elements.
 */
const row = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) [data-row-target]`;

/*
 * Only on the two rows the stage shows whole, so its view never moves: opens the first, which makes
 * it the current row, then the second again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: row(1), x: 0.5 },
  { wait: 400 },
  { click: true },
  { wait: 1200 },
  { to: row(2), x: 0.5, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 500 },
];

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 16, height: 12 };

/**
 * A list of people, each row opening that person, with Sam Lee's as the current one. Its first two
 * rows show whole and the third fades out at the stage's bottom. On a phone's lower, narrower tile,
 * only its first two rows, narrower, so it is drawn whole at about its own size there.
 */
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
