import { useLayoutEffect, useRef } from 'react';
import { Column, Page, PageHeader, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const sections = [
  { title: 'Overview', line: 'A year of growth.' },
  { title: 'Summary', line: 'Revenue rose 18%.' },
  { title: 'Revenue', line: 'Plans brought $3.1M.' },
  { title: 'Costs', line: 'Spending held at $2.6M.' },
];

const sectionPitchPx = 95;

const script: PointerStep[] = [
  { wait: 180 },
  { to: '.env-page-header', x: 0.7, y: 1.7 },
  { wait: 300 },
  { wheel: sectionPitchPx, duration: 450 },
  { wait: 780 },
  { wheel: sectionPitchPx, duration: 450 },
  { wait: 780 },
  { wheel: -2 * sectionPitchPx, duration: 650 },
  { wait: 540 },
  { leave: true },
  { wait: 240 },
];

export default function PageTile() {
  const narrow = useMedia(narrowGallery);
  const box = useRef<HTMLDivElement>(null);
  usePointer(script);
  useLayoutEffect(() => {
    const element = box.current;
    const summary = element?.querySelectorAll('section')[1];
    if (!element || !summary) return;
    const frameBox = element.getBoundingClientRect();
    const scale = frameBox.height / element.offsetHeight || 1;
    const top =
      (summary.getBoundingClientRect().top - frameBox.top) / scale +
      element.scrollTop -
      parseFloat(getComputedStyle(summary).scrollMarginBlockStart || '0');
    element.scrollTop = Math.round(top);
  }, [narrow]);
  return (
    <div
      ref={box}
      style={{
        inlineSize: narrow ? '10rem' : '12.5rem',
        blockSize: narrow ? '6.875rem' : '7.25rem',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollSnapType: 'y mandatory',
        borderRadius: 'var(--env-radius-lg)',
        background: 'var(--env-color-bg-page)',
      }}
    >
      <Page header={<PageHeader headingLevel={3} sticky title="Annual report" />}>
        <Column gap={9} style={{ paddingBlockEnd: '3rem' }}>
          {sections.map(({ title, line }) => (
            <Column
              key={title}
              gap={1}
              render={<section />}
              style={{ scrollSnapAlign: 'start', paddingBlockEnd: 'var(--env-space-2)' }}
            >
              <Text variant="title" render={<h4 />}>
                {title}
              </Text>
              <Text variant="body-sm" emphasis="muted">
                {line}
              </Text>
            </Column>
          ))}
        </Column>
      </Page>
    </div>
  );
}
