import { useEffect, useId, useRef, type MouseEvent } from 'react';
import { TableOfContents } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { prefersReducedMotion } from '@envui-internal/internal/motion/reducedMotion';

/** How tall the hidden article's view and each of its sections are, in px. */
const view = 100;

/** Eases a scroll in and out. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const entry = (name: string) => `.env-table-of-contents-link[href$="-${name}"]`;

/*
 * Chooses Configure, the reader's place gliding down to it, then Deploy, passing Domains, and then
 * Install again, back up the contents.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: entry('configure') },
  { wait: 400 },
  { click: true },
  { wait: 1100 },
  { to: entry('deploy'), duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 1100 },
  { to: entry('install'), duration: 500 },
  { wait: 200 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 400 },
];

/**
 * A guide's contents, with the reader at Install. The guide itself is out of sight: its sections
 * scroll in a hidden view of their own behind the contents, which follow that view as it scrolls.
 * So the reader's place glides as it does on a page, and a press on a link scrolls that view rather
 * than the gallery.
 */
export default function TableOfContentsTile() {
  const id = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const glide = useRef(0);
  useEffect(() => () => cancelAnimationFrame(glide.current), []);
  // Framed once on the whole list, it holds that view while the reader's place moves through it.
  useHeldView();
  // When the tile stops, the hidden article goes back to its top, rather than the tile being drawn
  // again, which would grow the marks again from nothing as the contents measure it.
  usePointer(script, {
    onRest: () => {
      cancelAnimationFrame(glide.current);
      if (scroller.current) scroller.current.scrollTop = 0;
    },
  });
  const section = (name: string) => `${id}-${name}`;
  /** Scrolls the hidden article to a section, as a link on a page does, at a reader's pace. */
  const go = (event: MouseEvent<HTMLElement>) => {
    const target = event.target instanceof Element ? event.target.closest('a') : null;
    const area = scroller.current;
    if (!target || !area) return;
    event.preventDefault();
    const element = area.ownerDocument.getElementById(target.getAttribute('href')?.slice(1) ?? '');
    if (!element) return;
    cancelAnimationFrame(glide.current);
    const from = area.scrollTop;
    const to = element.offsetTop - view / 4;
    if (prefersReducedMotion()) {
      area.scrollTop = to;
      return;
    }
    const duration = 300 + (Math.abs(to - from) / view) * 150;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      area.scrollTop = from + (to - from) * ease(progress);
      if (progress < 1) glide.current = requestAnimationFrame(step);
    };
    glide.current = requestAnimationFrame(step);
  };
  const sections = ['install', 'configure', 'domains', 'deploy'];
  return (
    <div onClickCapture={go} style={{ position: 'relative' }}>
      <div
        ref={scroller}
        aria-hidden
        style={{
          position: 'absolute',
          insetBlockStart: 0,
          insetInlineStart: 0,
          inlineSize: '100%',
          blockSize: view,
          overflowY: 'auto',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div style={{ paddingBlock: `${view / 4}px ${view}px` }}>
          {sections.map((name) => (
            <div key={name} id={section(name)} style={{ blockSize: view }} />
          ))}
        </div>
      </div>
      <TableOfContents
        aria-label="Sections of the guide"
        style={{ inlineSize: 'max-content' }}
        items={[
          { id: section('install'), label: 'Install' },
          {
            id: section('configure'),
            label: 'Configure',
            children: [{ id: section('domains'), label: 'Domains' }],
          },
          { id: section('deploy'), label: 'Deploy' },
        ]}
      />
    </div>
  );
}
