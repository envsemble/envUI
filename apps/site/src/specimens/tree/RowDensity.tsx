import RowDensity from '../../examples/tree/RowDensity';
import { useTimeline } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const densities = [
  { density: 'md', name: 'Medium' },
  { density: 'lg', name: 'Large' },
  { density: 'md', name: 'Medium' },
  { density: 'sm', name: 'Small' },
  { density: 'xs', name: 'Extra small' },
  { density: 'sm', name: 'Small' },
] as const;

function Densities() {
  // Each density held a moment: from Medium up to Large, down to Extra small and back.
  const step = useTimeline([1600, 1600, 1100, 1300, 1600, 1300]);
  const { density, name } = densities[step]!;
  return (
    <>
      <span className="catalogue-corner-label">{name}</span>
      <div
        className="catalogue-density-steps"
        style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}
      >
        <RowDensity density={density} />
      </div>
    </>
  );
}

/** One tree at each density in turn: the rows' room changes, never their text or icons. */
export default function RowDensityMotion() {
  return (
    <MotionStage label="the tree at each density">
      <Densities />
    </MotionStage>
  );
}
