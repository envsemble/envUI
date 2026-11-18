import { useEffect, useRef } from 'react';
import LongLabels from '../../examples/table-of-contents/LongLabels';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';

const sections = [
  'long-labels-before',
  'long-labels-move',
  'long-labels-owners',
  'long-labels-links',
];

function Guide() {
  const guide = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = guide.current;
    const readersSection = element?.querySelector<HTMLElement>(`#${sections[1]}`);
    if (element && readersSection) element.scrollTop = readersSection.offsetTop;
  }, []);
  return (
    <div
      ref={guide}
      aria-hidden
      style={{
        position: 'absolute',
        visibility: 'hidden',
        overflowY: 'auto',
        blockSize: '10rem',
        inlineSize: '1rem',
      }}
    >
      {sections.map((id) => (
        <div key={id} id={id} style={{ blockSize: '10rem' }} />
      ))}
    </div>
  );
}

export default function LongLabelsMotion() {
  return (
    <MotionStage label="the example's width changing">
      <WidthSweep widths={[20, 12]}>
        <LongLabels />
      </WidthSweep>
      <Guide />
    </MotionStage>
  );
}
