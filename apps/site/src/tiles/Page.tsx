import { useEffect, useRef } from 'react';
import { Column, Page, PageHeader, Text } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

const sections = ['Summary', 'Revenue', 'Costs'];

/** Where the page is scrolled to, step by step, in px: the top, further down, the top again. */
const scrolls = [0, 150, 0];

/** Eases a scroll in and out, as a wheel's does. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * A page in a box that scrolls, as a window does: it scrolls down, its sticky header staying at
 * the top and taking its fill as the sections pass beneath it, and back up.
 */
export default function PageTile() {
  const step = useTimeline([1100, 1900, 1300]);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const from = element.scrollTop;
    const to = scrolls[step]!;
    if (from === to) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      element.scrollTop = from + (to - from) * ease(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step]);
  return (
    <div
      ref={box}
      style={{
        inlineSize: '15rem',
        blockSize: '11rem',
        overflow: 'hidden',
        borderRadius: 'var(--env-radius-lg)',
        background: 'var(--env-color-bg-page)',
      }}
    >
      <Page header={<PageHeader headingLevel={3} sticky title="Annual report" />}>
        <Column gap={5}>
          {sections.map((section) => (
            <Column key={section} gap={2} render={<section />}>
              <Text variant="title" render={<h4 />}>
                {section}
              </Text>
              <Text emphasis="muted">The figures for the year, by quarter.</Text>
            </Column>
          ))}
        </Column>
      </Page>
    </div>
  );
}
