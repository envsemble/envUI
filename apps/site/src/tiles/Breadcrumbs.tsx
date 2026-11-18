import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Breadcrumbs } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { rootMotionDuration, rootMotionEasing } from '../shared/RootMotionTokens';
import type { TileWindow } from './Tiles';

const link = (index: number) => `.env-breadcrumbs-item:nth-child(${index}) > .env-breadcrumbs-link`;

const script: PointerStep[] = [
  { wait: 180 },
  { to: link(1), y: 0.6 },
  { wait: 360 },
  { to: link(2), y: 0.6, duration: 450 },
  { wait: 270 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 1020 },
  { cue: 'renew' },
  { wait: 300 },
];

const crossfadeDuration = () => rootMotionDuration('slow');

function Crossfade({ round, children }: { round: number; children: ReactNode }) {
  const [rounds, setRounds] = useState({ current: round, leaving: null as number | null });
  if (rounds.current !== round) setRounds({ current: round, leaving: rounds.current });
  const { leaving } = rounds;
  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(
      () => setRounds((now) => ({ current: now.current, leaving: null })),
      crossfadeDuration(),
    );
    return () => window.clearTimeout(timer);
  }, [leaving]);
  return (
    <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
      <Layer key={rounds.current} entering={leaving !== null}>
        {children}
      </Layer>
      {leaving !== null && (
        <Layer key={leaving} leaving>
          {children}
        </Layer>
      )}
    </div>
  );
}

function Layer({
  entering = false,
  leaving = false,
  children,
}: {
  entering?: boolean;
  leaving?: boolean;
  children: ReactNode;
}) {
  const element = useRef<HTMLDivElement>(null);
  const arrived = useRef(!entering);
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    element.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: crossfadeDuration(),
      easing: rootMotionEasing(),
    });
  }, []);
  useEffect(() => {
    if (!leaving) return;
    element.current?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], {
      duration: crossfadeDuration(),
      fill: 'forwards',
    });
  }, [leaving]);
  return (
    <div
      ref={element}
      aria-hidden={leaving || undefined}
      inert={leaving}
      style={{
        gridArea: '1 / 1',
        zIndex: leaving ? 0 : 1,
        inlineSize: '100%',
        display: 'grid',
        justifyItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

const levels = [
  { label: 'Home', href: '/' },
  { label: 'Plans', href: '/plans' },
  { label: 'Q3', href: '/plans/q3' },
];

function Trail() {
  const [depth, setDepth] = useState(levels.length);
  return (
    <Breadcrumbs
      wrap={false}
      items={levels.slice(0, depth).map(({ label, href }, index) =>
        index === depth - 1
          ? { label }
          : {
              label,
              href,
              onClick: (event: { preventDefault: () => void }) => {
                event.preventDefault();
                setDepth(index + 1);
              },
            },
      )}
    />
  );
}

export const tileWindow: TileWindow = { width: 15, height: 11.25 };

export default function BreadcrumbsTile() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Crossfade round={round}>
      <div style={{ display: 'grid', justifyItems: 'start' }}>
        <div style={{ gridArea: '1 / 1' }}>
          <Trail />
        </div>
        <div aria-hidden="true" inert style={{ gridArea: '1 / 1', visibility: 'hidden' }}>
          <Trail />
        </div>
      </div>
    </Crossfade>
  );
}
