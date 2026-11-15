import { useState, type MouseEvent } from 'react';
import { Column, Pager, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const pages = ['Intro', 'Setup', 'Usage', 'Theme', 'Deploy'];

const first = 1;

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
