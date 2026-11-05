import { useState, type MouseEvent } from 'react';
import { Pager } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const pages = ['Intro', 'Setup', 'Usage', 'Theme', 'Deploy'];

/** The page the guide opens at, with a page on either side of it. */
const first = 1;

/** On through the guide twice by Next, each page's neighbours following, and back twice. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-pager-link-next', x: 0.5 },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 900 },
  { to: '.env-pager-link-previous', x: 0.5, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/**
 * The links before and after a page of a guide, side by side, so both show in a gallery's low
 * tile. A page at either end of the guide shows only the link it has.
 * In a phone's narrower tile it is narrower too, so it is drawn at about its own size there.
 */
export default function PagerTile() {
  const narrow = useMedia(narrowGallery);
  const [page, setPage] = useState(first);
  usePointer(script, { onRest: () => setPage(first) });
  const link = (to: number) => {
    const title = pages[to];
    return (
      title && {
        href: `#${title.toLowerCase()}`,
        children: title,
        onClick: (event: MouseEvent) => {
          event.preventDefault();
          setPage(to);
        },
      }
    );
  };
  const previous = link(page - 1);
  const next = link(page + 1);
  return (
    <Pager.Root aria-label="Guide pages" style={{ inlineSize: narrow ? '10.5rem' : '12rem' }}>
      {previous && <Pager.Previous {...previous} />}
      {next && <Pager.Next {...next} />}
    </Pager.Root>
  );
}
