import ProjectMembers from '../../examples/avatar/ProjectMembers';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const pile = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-avatar-group`;

/*
 * The pointer comes onto the first project's pile, which spreads along its arch; it moves down to
 * the second's, which spreads as the first settles back, and leaves.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: pile(1), x: 0.45, y: 0.6 },
  { wait: 1500 },
  { to: pile(2), x: 0.45, y: 0.6, duration: 500 },
  { wait: 1500 },
  { leave: true },
  { wait: 1000 },
];

function Hovering() {
  usePointer(script);
  return <ProjectMembers />;
}

/** The projects' piles of members, each spread in turn by a pointer no one sees. */
export default function ProjectMembersMotion() {
  return (
    <MotionStage label="the piles spreading">
      <Hovering />
    </MotionStage>
  );
}
