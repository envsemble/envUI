import { useEffect, useRef } from 'react';
import { Column, Page, PageHeader, Text } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

const sections = ['Summary', 'Revenue', 'Costs'];

/** Eases a scroll in and out, as a wheel's does. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * A page and its sticky header are taller than a gallery's low tile at their own size: the box is
 * drawn at four fifths of it, as an application's frame is (Scaffold.tsx), and as low as the
 * header and one section, so it ends on a whole line.
 */
const smaller = { transform: 'scale(0.8)', transformOrigin: '0 0' } as const;

/**
 * A page in a box that scrolls, as a window does: it scrolls down a section at a time, its sticky
 * header staying at the top and taking its fill as the sections pass beneath it, and back up.
 * Each step rests with one whole section under the header.
 */
export default function PageTile() {
  const step = useTimeline([1100, 1700, 1700]);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const from = element.scrollTop;
    const shown = element.querySelectorAll('section');
    const to = (shown[step]?.offsetTop ?? 0) - (shown[0]?.offsetTop ?? 0);
    if (from === to) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 750);
      element.scrollTop = from + (to - from) * ease(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step]);
  return (
    <div style={smaller}>
      <div
        ref={box}
        style={{
          inlineSize: '15rem',
          blockSize: '7.75rem',
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
    </div>
  );
}
