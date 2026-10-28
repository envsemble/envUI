import { useState, type MouseEvent, type ReactNode } from 'react';
import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { usePointer, type PointerStep } from '../motion/Motion';

const pages = ['Overview', 'Install', 'Configure', 'Deploy', 'Monitor'];

/** On through the guide twice by Up next, each page's neighbours following, and back twice. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-pager-link-next', x: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 900 },
  { to: '.env-pager-link-previous', x: 0.6, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/** The links before and after a guide's Install page, one above the other, the same width. */
export default function PagerTile() {
  const [page, setPage] = useState(1);
  usePointer(script);
  const link = (to: number, icon: ReactNode) => ({
    href: `#${pages[to]!.toLowerCase()}`,
    children: pages[to],
    icon,
    style: { inlineSize: '100%' },
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      setPage(to);
    },
  });
  return (
    <Pager.Root
      aria-label="Guide pages"
      style={{ inlineSize: '11rem' }}
      previous={link(page - 1, <ArrowBack />)}
      next={link(page + 1, <ArrowForward />)}
    />
  );
}
