import AccountButton from '../../examples/avatar/AccountButton';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/* The pointer rests on the avatar: the name's tooltip appears, and goes as the pointer leaves. */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-avatar-button', x: 0.55, y: 0.6 },
  { wait: 2600 },
  { leave: true },
  { wait: 1100 },
];

function Hovering() {
  usePointer(script);
  return <AccountButton />;
}

/** The account's avatar button, its name shown in a tooltip as a pointer no one sees rests on it. */
export default function AccountButtonMotion() {
  return (
    <MotionStage label="the name showing in a tooltip" height="11rem">
      <Hovering />
    </MotionStage>
  );
}
