import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import NarrowNavigation from '../../examples/scaffold/NarrowNavigation';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { useOnScreen } from '../../figures/DeviceFrame';

/** A window wide enough for the drawer, in rem: an expanded one. */
const windowWidth = 56;

/**
 * The example in a window of a drawer's width, drawn smaller to fit the stage: the Scaffold
 * follows its own width, which the drawing doesn't change.
 */
function Fitted({ children }: { children: ReactNode }) {
  const room = useRef<HTMLDivElement>(null);
  const window = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });
  useLayoutEffect(() => {
    const outer = room.current;
    const inner = window.current;
    if (!outer || !inner) return;
    const measure = () => {
      const scale = Math.min(1, outer.clientWidth / inner.offsetWidth);
      setFit({ scale, height: inner.offsetHeight * scale });
    };
    measure();
    // Measured again in the next frame as the stage's width changes: the height it sets resizes
    // what it observes.
    let request = 0;
    let width = outer.clientWidth;
    const observer = new ResizeObserver(() => {
      if (outer.clientWidth === width) return;
      width = outer.clientWidth;
      cancelAnimationFrame(request);
      request = requestAnimationFrame(measure);
    });
    observer.observe(outer);
    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
    };
  }, []);
  return (
    // As wide as the stage, whatever the window holds: its width doesn't come from the window.
    <div
      ref={room}
      style={{
        justifySelf: 'stretch',
        containerType: 'inline-size',
        blockSize: fit.height || undefined,
      }}
    >
      <div
        ref={window}
        style={{
          inlineSize: `${windowWidth}rem`,
          transform: `scale(${fit.scale})`,
          transformOrigin: '0 0',
          marginInline: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const toggle = '.env-top-bar .env-icon-button';

/*
 * In a window wide enough for the drawer, the pointer presses the button in the top bar: the
 * drawer narrows to the rail; it presses it again, and the drawer comes back.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: toggle },
  { wait: 500 },
  { click: true },
  { wait: 1700 },
  { click: true },
  { wait: 1400 },
  { leave: true },
  { wait: 600 },
];

function Narrowing() {
  usePointer(script);
  // On a window's screen, which is wide enough for the drawer, it shows as it is.
  const onScreen = useOnScreen();
  return onScreen ? (
    <NarrowNavigation />
  ) : (
    <Fitted>
      <NarrowNavigation />
    </Fitted>
  );
}

/** The drawer narrowed to the rail and widened again by the top bar's button. */
export default function NarrowNavigationMotion() {
  return (
    <MotionStage label="the drawer narrowed to the rail and back" stage="shaded">
      <Narrowing />
    </MotionStage>
  );
}
