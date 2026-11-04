import { useState } from 'react';
import { Pagination } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const button = (direction: 'previous' | 'next') =>
  `.env-pagination-button[data-direction="${direction}"]`;

/*
 * Two pages on by the next page's button, the range following, and two back by the previous one.
 * The pages it passes all show ranges as wide, so the buttons stay where they are. Each press
 * comes before the buttons' tooltips would open, and a pressed button's tooltip stays closed, so
 * the range is all that changes.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: button('next') },
  { wait: 300 },
  { click: true },
  { wait: 800 },
  { click: true },
  { wait: 900 },
  { to: button('previous'), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 800 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/** A list's second page of ten, with the buttons to the pages before and after it. */
export default function PaginationTile() {
  const [page, setPage] = useState(2);
  usePointer(script);
  return (
    <Pagination
      aria-label="Report pages"
      page={page}
      pageSize={10}
      total={48}
      onPageChange={setPage}
    />
  );
}
