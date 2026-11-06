import { useLayoutEffect, useRef } from 'react';
import { Column, Page, PageHeader, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

/** The page's sections: an overview, then the three it rests on in turn. */
const sections = ['Overview', 'Summary', 'Revenue', 'Costs'];

/**
 * About a section's pitch, in px: a turn of the wheel this far scrolls one section on, and the box,
 * which snaps to its sections' starts, settles on that section's start under the header.
 */
const pitch = 95;

/**
 * The pointer comes over the page and turns the wheel a section on, twice, Summary to Revenue to
 * Costs, then back up to Summary, as a person reads a report, so the cursor shows why the page
 * scrolls under its header.
 */
const script: PointerStep[] = [
  { wait: 300 },
  // Over the section below the header: the page's content is taller than the box, so it is aimed
  // at from the header, which stays where it is.
  { to: '.env-page-header', x: 0.7, y: 1.7 },
  { wait: 500 },
  { wheel: pitch, duration: 450 },
  { wait: 1300 },
  { wheel: pitch, duration: 450 },
  { wait: 1300 },
  { wheel: -2 * pitch, duration: 650 },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/**
 * A page in a box that scrolls, as a window does, at its own size and as low as its header and one
 * whole section: its still is scrolled past the overview to Summary, under the header stuck at the
 * top with the fill it takes once content scrolls beneath it. As it plays, the pointer's wheel
 * scrolls it a section at a time and back; the box snaps to the sections' starts, each held clear
 * of the header by the Page's own scroll margin, so each turn rests with one whole section under
 * it; each section ends in room as deep as that margin's, so the one above is wholly past the
 * header's top. Room after the last lets it scroll there too. In a phone's narrower tile the box is
 * narrower, so the page is drawn at about its own size there.
 */
export default function PageTile() {
  const narrow = useMedia(narrowGallery);
  const box = useRef<HTMLDivElement>(null);
  usePointer(script);
  // Its still is drawn at Summary's start at once.
  useLayoutEffect(() => {
    const element = box.current;
    const section = element?.querySelectorAll('section')[1];
    if (!element || !section) return;
    const frameBox = element.getBoundingClientRect();
    const scale = frameBox.height / element.offsetHeight || 1;
    const top =
      (section.getBoundingClientRect().top - frameBox.top) / scale +
      element.scrollTop -
      parseFloat(getComputedStyle(section).scrollMarginBlockStart || '0');
    element.scrollTop = Math.round(top);
  }, [narrow]);
  return (
    <div
      ref={box}
      style={{
        inlineSize: narrow ? '10rem' : '12.5rem',
        blockSize: narrow ? '6.875rem' : '7.25rem',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        scrollSnapType: 'y mandatory',
        borderRadius: 'var(--env-radius-lg)',
        background: 'var(--env-color-bg-page)',
      }}
    >
      <Page header={<PageHeader headingLevel={3} sticky title="Annual report" />}>
        <Column gap={9} style={{ paddingBlockEnd: '3rem' }}>
          {sections.map((section) => (
            <Column
              key={section}
              gap={1}
              render={<section />}
              style={{ scrollSnapAlign: 'start', paddingBlockEnd: 'var(--env-space-2)' }}
            >
              <Text variant="title" render={<h4 />}>
                {section}
              </Text>
              <Text variant="body-sm" emphasis="muted">
                Figures by quarter.
              </Text>
            </Column>
          ))}
        </Column>
      </Page>
    </div>
  );
}
