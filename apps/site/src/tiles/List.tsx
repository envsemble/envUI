import { useState } from 'react';
import { Avatar, Link, List } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const people = [
  { id: 'alex', name: 'Alex Morgan', role: 'Design' },
  { id: 'sam', name: 'Sam Lee', role: 'Engineering' },
  { id: 'priya', name: 'Priya Shah', role: 'Product' },
];

/*
 * A row's link, which covers the row with a pseudo-element, so a press anywhere on the row follows
 * it: the pointer no one sees aims at the link itself, as it finds elements, not pseudo-elements.
 */
const row = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) [data-row-target]`;

/* Down the rows, the last one opened, which makes it the current row, and the second again. */
const wide: PointerStep[] = [
  { wait: 300 },
  { to: row(1), x: 0.5 },
  { wait: 450 },
  { to: row(3), x: 0.5, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1200 },
  { to: row(2), x: 0.5, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 500 },
];

/* On a phone's two rows: the first opened, which makes it the current row, and the second again. */
const short: PointerStep[] = [
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

/**
 * A list of people, each row opening that person, Sam Lee's the current one; on a phone's lower,
 * narrower tile, its first two rows, narrower, so it is drawn whole at about its own size there.
 */
export default function ListTile() {
  const [current, setCurrent] = useState('sam');
  const narrow = useMedia(narrowGallery);
  usePointer(narrow ? short : wide);
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
