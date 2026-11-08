import { useState } from 'react';
import MenuOnPhones from '../../examples/app-frame/MenuOnPhones';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';
import { keepLinksInPlace } from '../../figures/LiveExample';

const menu = '[aria-label="Open the chapters"]';
const chapter = (index: number, where: string) =>
  `${where} .env-navigation-drawer-list > li:nth-child(${index}) > .env-navigation-drawer-item`;

/*
 * At 22 rem the pointer taps the menu button: the sheet with the chapters slides in, it picks
 * Installing, and the sheet closes on that chapter. The frame widens to 44 rem, where the chapters
 * sit in a drawer beside the page, and the pointer goes back to Introduction there. Then the frame
 * narrows again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: menu, x: 0.5, y: 2.6 },
  { to: menu, x: 0.5, y: 0.5, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: chapter(2, '.env-sheet'), x: 0.35, y: 0.5, duration: 550 },
  { wait: 250 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 900 },
  { cue: 'wide' },
  // The frame's travel to 44 rem.
  { wait: 3300 },
  { to: chapter(1, '.catalogue-width-sweep-frame'), x: 0.35, y: 2.5 },
  { to: chapter(1, '.catalogue-width-sweep-frame'), x: 0.35, y: 0.5, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 900 },
  { cue: 'narrow' },
  // The way back to 22 rem, and a moment there.
  { wait: 4200 },
];

function Sweeping() {
  const [at, setAt] = useState(0);
  usePointer(script, { onCue: (cue) => setAt(cue === 'wide' ? 1 : 0) });
  return (
    // The chapters' links stay on this page, in the frame and in the sheet.
    <div {...keepLinksInPlace} style={{ display: 'contents' }}>
      <WidthSweep widths={[22, 44]} at={at} classes>
        <MenuOnPhones />
      </WidthSweep>
    </div>
  );
}

/** The frame at a phone's width, whose menu a pointer opens, and at a tablet's, with its drawer. */
export default function MenuOnPhonesMotion() {
  return (
    <MotionStage label="the chapters opened from the menu as the width changes" stage="shaded">
      <Sweeping />
    </MotionStage>
  );
}
