import { Surface, Text } from '@envsemble/envui';
import ViewControls from '../../examples/toolbar/ViewControls';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const button = (label: string) => `.env-toolbar-button[aria-label="${label}"]`;

/*
 * The pointer runs along the toolbar over the diagram: Zoom out, Zoom in and Diagram help each
 * show their names at once, with no wait, and the pointer leaves.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: button('Zoom out'), x: 0.5, y: 2.2 },
  { to: button('Zoom out'), x: 0.5, y: 0.55, duration: 450 },
  { wait: 900 },
  { to: button('Zoom in'), x: 0.5, y: 0.55, duration: 350 },
  { wait: 900 },
  { to: button('Diagram help'), x: 0.5, y: 0.55, duration: 400 },
  { wait: 1000 },
  { to: button('Diagram help'), x: 0.5, y: 2.4, duration: 400 },
  { leave: true },
  { wait: 900 },
];

const steps = ['Sign up', 'Verify e-mail', 'Choose a plan'];

/** An arrow from one step of the flow to the next. */
function Arrow() {
  return (
    <svg width="40" height="12" viewBox="0 0 40 12" aria-hidden style={{ flex: 'none' }}>
      <path
        d="M1 6h36m-5-4 5 4-5 4"
        fill="none"
        stroke="var(--env-color-border-neutral-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A small flow diagram, the dense content the toolbar floats over. */
function Diagram() {
  return (
    <Surface
      background="page"
      radius="xl"
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        inlineSize: 'min(100%, 30rem)',
        blockSize: '12rem',
        border: '1px solid var(--env-color-border-muted)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBlockEnd: '3rem' }}
      >
        {steps.map((step, index) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {index > 0 && <Arrow />}
            <Surface
              background="muted"
              padding={2}
              radius="sm"
              style={{ border: '1px solid var(--env-color-border-muted)' }}
            >
              <Text variant="body-sm">{step}</Text>
            </Surface>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          insetBlockEnd: '0.75rem',
          insetInline: 0,
          display: 'grid',
          justifyItems: 'center',
        }}
      >
        <ViewControls />
      </div>
    </Surface>
  );
}

function Scanning() {
  usePointer(script);
  return <Diagram />;
}

/** View controls floating over a diagram, their names shown at once as a pointer runs along them. */
export default function ViewControlsMotion() {
  return (
    <MotionStage label="the buttons' names showing at once">
      <Scanning />
    </MotionStage>
  );
}
