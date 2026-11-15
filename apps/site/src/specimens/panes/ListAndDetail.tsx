import type { MouseEvent } from 'react';
import ListAndDetail from '../../examples/panes/ListAndDetail';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const message = (id: string) => `.env-panes-list a[href="/inbox/${id}"]`;
const back = '.env-panes-back .env-button';

const script: PointerStep[] = [
  { wait: 300 },
  { to: message('budget'), x: 0.4 },
  { wait: 210 },
  { click: true },
  { wait: 1020 },
  { to: back, duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 600 },
  { to: message('launch'), x: 0.4, duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 900 },
  { to: back, duration: 500 },
  { wait: 180 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 540 },
];

function openMessageHereNotTheLinksPage(event: MouseEvent) {
  if (event.target instanceof Element && event.target.closest('a')) event.preventDefault();
}

function Reading() {
  usePointer(script);
  return (
    <div style={{ inlineSize: '100%' }} onClickCapture={openMessageHereNotTheLinksPage}>
      <ListAndDetail />
    </div>
  );
}

export default function ListAndDetailMotion() {
  return (
    <MotionStage label="a message opened from the list and back">
      <Reading />
    </MotionStage>
  );
}
