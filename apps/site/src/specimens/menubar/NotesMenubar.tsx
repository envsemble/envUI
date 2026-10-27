import NotesMenubar from '../../examples/menubar/NotesMenubar';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const trigger = (index: number) =>
  `.env-menubar-trigger:nth-child(${index} of .env-menubar-trigger)`;

/*
 * The pointer opens File, then slides along the bar: Edit's menu and View's follow it, one at a
 * time, without another press. It closes View's with a press on its trigger.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: trigger(1), x: 0.5, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 1100 },
  { to: trigger(2), x: 0.5, y: 0.6, duration: 450 },
  { wait: 1100 },
  { to: trigger(3), x: 0.5, y: 0.6, duration: 450 },
  { wait: 1100 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 900 },
];

function Sliding() {
  usePointer(script);
  return <NotesMenubar />;
}

/** The notes menubar, its menus followed along the bar by a pointer no one sees. */
export default function NotesMenubarMotion() {
  return (
    <MotionStage label="the menus following the pointer">
      <Sliding />
    </MotionStage>
  );
}
