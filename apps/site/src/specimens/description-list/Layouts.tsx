import { DescriptionList } from '@envsemble/envui';
import { useTimeline } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { CornerLabel } from '../../figures/foundations/Steps';

const layouts = [
  { layout: 'auto', name: 'Automatic' },
  { layout: 'inline', name: 'Inline' },
  { layout: 'stacked', name: 'Stacked' },
] as const;

/*
 * One list at one width, wide enough for its labels beside their values, in each layout in turn:
 * automatic, which puts them beside their values at this width, inline, and stacked, which puts
 * them above.
 */
function Layouts() {
  const step = useTimeline([1800, 1800, 1800]);
  const { layout, name } = layouts[step];
  return (
    <>
      <CornerLabel>{name}</CornerLabel>
      {/* The width the list keeps, outlined, as tall as the stacked list, the list at its top, so
          nothing moves but the labels. */}
      <div
        className="catalogue-fixed-frame"
        style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: '9.5rem' }}
      >
        <DescriptionList.Root layout={layout} aria-label="Project details">
          <DescriptionList.Item label="Owner">Alex Morgan</DescriptionList.Item>
          <DescriptionList.Item label="Last updated">4 March 2026</DescriptionList.Item>
          <DescriptionList.Item label="Repository">example.com/northwind</DescriptionList.Item>
        </DescriptionList.Root>
      </div>
    </>
  );
}

/** A list stepping through its layouts at one width. */
export default function LayoutsMotion() {
  return (
    <MotionStage label="the list in each layout">
      <Layouts />
    </MotionStage>
  );
}
