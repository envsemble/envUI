import { useEffect, useRef } from 'react';
import LongLabels from '../../examples/table-of-contents/LongLabels';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';

/** The sections the contents lead to, as the migration guide beside them holds them. */
const sections = [
  'long-labels-before',
  'long-labels-move',
  'long-labels-owners',
  'long-labels-links',
];

/**
 * The guide the contents stand beside, out of sight: scrolled to its second section, which is the
 * reader's place, so the shape swells beside it, on every line of its label.
 */
function Guide() {
  const guide = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = guide.current;
    const second = element?.querySelector<HTMLElement>(`#${sections[1]}`);
    if (element && second) element.scrollTop = second.offsetTop;
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

/** The contents of a guide with long labels, narrowing, with the reader in its second section. */
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
