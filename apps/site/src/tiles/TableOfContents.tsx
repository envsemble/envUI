import { useEffect, useId, useRef, type MouseEvent } from 'react';
import { TableOfContents } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { prefersReducedMotion } from '../shared/ReducedMotion';

const sectionHeightPx = 100;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const entry = (name: string) => `.env-table-of-contents-link[href$="-${name}"]`;

const script: PointerStep[] = [
  { wait: 180 },
  { to: entry('configure') },
  { wait: 240 },
  { click: true },
  { wait: 660 },
  { to: entry('deploy'), duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 660 },
  { to: entry('install'), duration: 500 },
  { wait: 120 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 240 },
];

export default function TableOfContentsTile() {
  const id = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const glide = useRef(0);
  useEffect(() => () => cancelAnimationFrame(glide.current), []);
  useHeldView();
  usePointer(script, {
    onRest: () => {
      cancelAnimationFrame(glide.current);
      if (scroller.current) scroller.current.scrollTop = 0;
    },
  });
  const section = (name: string) => `${id}-${name}`;
  const go = (event: MouseEvent<HTMLElement>) => {
    const target = event.target instanceof Element ? event.target.closest('a') : null;
    const area = scroller.current;
    if (!target || !area) return;
    event.preventDefault();
    const element = area.ownerDocument.getElementById(target.getAttribute('href')?.slice(1) ?? '');
    if (!element) return;
    cancelAnimationFrame(glide.current);
    const from = area.scrollTop;
    const to = element.offsetTop - sectionHeightPx / 4;
    if (prefersReducedMotion()) {
      area.scrollTop = to;
      return;
    }
    const duration = 300 + (Math.abs(to - from) / sectionHeightPx) * 150;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      area.scrollTop = from + (to - from) * easeInOut(progress);
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
          blockSize: sectionHeightPx,
          overflowY: 'auto',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div style={{ paddingBlock: `${sectionHeightPx / 4}px ${sectionHeightPx}px` }}>
          {sections.map((name) => (
            <div key={name} id={section(name)} style={{ blockSize: sectionHeightPx }} />
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
