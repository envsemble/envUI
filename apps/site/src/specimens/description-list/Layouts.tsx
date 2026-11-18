import { DescriptionList } from '@envsemble/envui';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';
import { CornerLabel } from '../../figures/foundations/Steps';

const layouts = [
  { layout: 'auto', name: 'Automatic' },
  { layout: 'inline', name: 'Inline' },
  { layout: 'stacked', name: 'Stacked' },
] as const;

const stackedListHeight = '9.5rem';

function Layouts() {
  const step = useTimeline([1080, 1080, 1080]);
  const { layout, name } = layouts[step];
  return (
    <>
      <CornerLabel>{name}</CornerLabel>
      <div
        className="catalogue-fixed-frame"
        style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: stackedListHeight }}
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

export default function LayoutsMotion() {
  return (
    <MotionStage label="the list in each layout">
      <Layouts />
    </MotionStage>
  );
}
