import { useState } from 'react';
import { Pagination } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const button = (direction: 'previous' | 'next') =>
  `.env-pagination-button[data-direction="${direction}"]`;

/*
 * Goes two pages forward with the next page's button, the range following, and two back with the
 * previous one. The pages it passes all show ranges of the same width, so the buttons stay in
 * place. Each press comes before the buttons' tooltips would open, and a pressed button's tooltip
 * stays closed, so the range is all that changes.
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: button('next') },
  { wait: 180 },
  { click: true },
  { wait: 480 },
  { click: true },
  { wait: 540 },
  { to: button('previous'), duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 480 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
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
