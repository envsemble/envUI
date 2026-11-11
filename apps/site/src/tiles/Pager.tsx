import { useState, type MouseEvent } from 'react';
import { Column, Pager, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const pages = ['Intro', 'Setup', 'Usage', 'Theme', 'Deploy'];

/** The page the guide opens at, with a page on either side of it. */
const first = 1;

/**
 * Goes forward through the guide twice with Next, each page's neighbours following, and back twice.
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: '.env-pager-link-next', x: 0.5 },
  { wait: 240 },
  { click: true },
  { wait: 540 },
  { click: true },
  { wait: 540 },
  { to: '.env-pager-link-previous', x: 0.5, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 540 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
];

/**
 * The bottom of a page of a guide: the page's title, then the links before and after it, side by
 * side, so both show in a gallery's low tile and each press shows which page it led to. A page at
 * either end of the guide shows only the link it has. In a phone's narrower tile the pager is
 * narrower too, so it is drawn at about its own size there.
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
    <Column
      gap={3}
      style={{ inlineSize: 'max-content', maxInlineSize: narrow ? '10.5rem' : '12rem' }}
    >
      <Text variant="title" render={<h2 />}>
        {pages[page]}
      </Text>
      <Pager.Root aria-label="Guide pages">
        {previous && <Pager.Previous {...previous} />}
        {next && <Pager.Next {...next} />}
      </Pager.Root>
    </Column>
  );
}
