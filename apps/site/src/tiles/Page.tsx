import { useEffect, useRef } from 'react';
import { Column, Page, PageHeader, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const sections = ['Summary', 'Revenue', 'Costs'];

/**
 * How long a scroll to the next section takes, in ms: brief beside the hold on each, so the page
 * is mostly seen resting on a section's start rather than with lines passing under its header.
 */
const scrollTakes = 400;

/** Eases a scroll in and out, as a wheel's does. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * A page in a box that scrolls, as a window does, at its own size and as low as its header and one
 * whole section: its still is scrolled to the first section, under the header stuck at the top
 * with its fill, and it scrolls down a section at a time and back. Each step rests with one whole
 * section just under the header, snapped to its start; room after the last lets it scroll there
 * too. In a phone's narrower tile the box is narrower, so the page is drawn at about its own size
 * there.
 */
export default function PageTile() {
  const step = useTimeline([2000, 2000, 2000]);
  const narrow = useMedia(narrowGallery);
  const box = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const from = element.scrollTop;
    const section = element.querySelectorAll('section')[step];
    const header = element.querySelector<HTMLElement>('.env-page-header');
    // The section's top in the box's content, read through the tile's scale, just under the header
    // stuck at the box's top.
    const frameBox = element.getBoundingClientRect();
    const scale = frameBox.height / element.offsetHeight || 1;
    const top = section ? (section.getBoundingClientRect().top - frameBox.top) / scale + from : 0;
    const to = header ? Math.round(top - header.offsetHeight - 4) : 0;
    if (from === to) return;
    // Its still is drawn there at once rather than scrolled to.
    if (!placed.current) {
      placed.current = true;
      element.scrollTop = to;
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / scrollTakes);
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
        inlineSize: narrow ? '10rem' : '12.5rem',
        blockSize: '6.25rem',
        overflow: 'hidden',
        borderRadius: 'var(--env-radius-lg)',
        background: 'var(--env-color-bg-page)',
      }}
    >
      <Page header={<PageHeader headingLevel={3} sticky title="Annual report" />}>
        <Column gap={5} style={{ paddingBlockEnd: '3rem' }}>
          {sections.map((section) => (
            <Column key={section} gap={1} render={<section />}>
              <Text variant="title" render={<h4 />}>
                {section}
              </Text>
              <Text emphasis="muted">Figures by quarter.</Text>
            </Column>
          ))}
        </Column>
      </Page>
    </div>
  );
}
