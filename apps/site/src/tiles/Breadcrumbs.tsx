import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Breadcrumbs } from '@envsemble/envui';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';
import { rootMotionDuration, rootMotionEasing } from '../motion/RootMotionTokens';

const link = (index: number) => `.env-breadcrumbs-item:nth-child(${index}) > .env-breadcrumbs-link`;

/**
 * Along the trail, then a press on Plans, a level back: the trail ends there, Plans now the current
 * page, the pointer resting on it a moment so the press reads as what shortened it, and holds so a
 * while, the pointer gone; then, as the loop starts over, it is drawn anew as
 * it began, crossfading into the whole trail (Crossfade), since nothing on the trail leads forward
 * again, and the pointer walks it again, so the loop is paced across the whole of a look at the
 * card rather than holding still after its first seconds.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: link(1), y: 0.6 },
  { wait: 600 },
  { to: link(2), y: 0.6, duration: 450 },
  { wait: 450 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 1700 },
  { cue: 'renew' },
  { wait: 500 },
];

/** How long the trail drawn anew takes to crossfade in over the one it replaces: the slow token. */
const fade = () => rootMotionDuration('slow');

/**
 * Draws its children anew whenever `round` changes, the new ones fading in over the old, which
 * fade out under them once they are half in, in one place, so what the two share, such as a
 * trail's first levels, holds still and the tile is never empty between them.
 */
function Crossfade({ round, children }: { round: number; children: ReactNode }) {
  const [rounds, setRounds] = useState({ current: round, leaving: null as number | null });
  if (rounds.current !== round) setRounds({ current: round, leaving: rounds.current });
  const { leaving } = rounds;
  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(
      () => setRounds((now) => ({ current: now.current, leaving: null })),
      fade(),
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

/** One round of a crossfade: fading in as it arrives, or out under it as it goes, unreachable then. */
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
      duration: fade(),
      easing: rootMotionEasing(),
    });
  }, []);
  useEffect(() => {
    if (!leaving) return;
    element.current?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], {
      duration: fade(),
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

/**
 * The trail, which a link pressed takes back to its level, in the tile rather than the site; its
 * last level short, the same at every width, so the trail is drawn at about its own size in a
 * phone's narrower tile too.
 */
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

/**
 * A trail of three levels, the last the current page, on one line at every width. The trail keeps
 * its start where it is as it shortens: it lies at the start of a box as wide as the whole trail,
 * which a copy of it, hidden and after it, so the pointer's aims find the trail itself, holds
 * open.
 */
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
