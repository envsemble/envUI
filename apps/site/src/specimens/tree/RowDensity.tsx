import RowDensity from '../../examples/tree/RowDensity';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const densities = [
  { density: 'md', name: 'Medium' },
  { density: 'lg', name: 'Large' },
  { density: 'md', name: 'Medium' },
  { density: 'sm', name: 'Small' },
  { density: 'xs', name: 'Extra small' },
  { density: 'sm', name: 'Small' },
] as const;

function Densities() {
  const step = useTimeline([960, 960, 660, 780, 960, 780]);
  const { density, name } = densities[step];
  return (
    <>
      <span className="catalogue-corner-label">{name}</span>
      <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
        <RowDensity density={density} />
      </div>
    </>
  );
}

export default function RowDensityMotion() {
  return (
    <MotionStage label="the tree at each density">
      <Densities />
    </MotionStage>
  );
}
