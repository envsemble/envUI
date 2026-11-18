import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import NarrowNavigation from '../../examples/scaffold/NarrowNavigation';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { useOnScreen } from '../../figures/DeviceFrame';
import { remeasure } from '../../shared/Remeasure';

const expandedWindowWidthRem = 56;

function Fitted({ children }: { children: ReactNode }) {
  const room = useRef<HTMLDivElement>(null);
  const window = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });
  useLayoutEffect(() => {
    const outer = room.current;
    const inner = window.current;
    if (!outer || !inner) return;
    let lastMeasuredStageWidth = -1;
    const measure = () => {
      const stageWidthUnchanged = outer.clientWidth === lastMeasuredStageWidth;
      if (stageWidthUnchanged) return;
      lastMeasuredStageWidth = outer.clientWidth;
      const scale = Math.min(1, outer.clientWidth / inner.offsetWidth);
      setFit({ scale, height: inner.offsetHeight * scale });
    };
    return remeasure(measure, { first: 'now', resize: [outer] }).stop;
  }, []);
  return (
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
          inlineSize: `${expandedWindowWidthRem}rem`,
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

const script: PointerStep[] = [
  { wait: 300 },
  { to: toggle },
  { wait: 300 },
  { click: true },
  { wait: 1020 },
  { click: true },
  { wait: 840 },
  { leave: true },
  { wait: 360 },
];

function Narrowing() {
  usePointer(script);
  const onScreen = useOnScreen();
  return onScreen ? (
    <NarrowNavigation />
  ) : (
    <Fitted>
      <NarrowNavigation />
    </Fitted>
  );
}

export default function NarrowNavigationMotion() {
  return (
    <MotionStage label="the drawer narrowed to the rail and back" stage="shaded">
      <Narrowing />
    </MotionStage>
  );
}
