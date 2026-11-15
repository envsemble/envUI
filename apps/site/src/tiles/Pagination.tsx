import { useState } from 'react';
import { Pagination } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const button = (direction: 'previous' | 'next') =>
  `.env-pagination-button[data-direction="${direction}"]`;

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
