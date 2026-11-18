import ProjectMembers from '../../examples/avatar/ProjectMembers';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const pile = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-avatar-group`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: pile(1), x: 0.45, y: 0.6 },
  { wait: 900 },
  { to: pile(2), x: 0.45, y: 0.6, duration: 500 },
  { wait: 900 },
  { leave: true },
  { wait: 600 },
];

function Hovering() {
  usePointer(script);
  return <ProjectMembers />;
}

export default function ProjectMembersMotion() {
  return (
    <MotionStage label="the piles spreading">
      <Hovering />
    </MotionStage>
  );
}
