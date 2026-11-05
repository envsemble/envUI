import { useState } from 'react';
import { Breadcrumbs } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';
import { Renew } from '../motion/Renew';

const link = (index: number) => `.env-breadcrumbs-item:nth-child(${index}) > .env-breadcrumbs-link`;

/**
 * Along the trail, then a press on Plans, a level back: the trail ends there, Plans now the current
 * page, and holds so for the rest of a look at the card; only then, long after, is it drawn anew as
 * it began, with a short fade (Renew), since nothing on the trail leads forward again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: link(1), y: 0.6 },
  { wait: 500 },
  { to: link(2), y: 0.6, duration: 450 },
  { wait: 400 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 9000 },
  { cue: 'renew' },
  { wait: 500 },
];

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
    <Renew round={round}>
      <div style={{ display: 'grid', justifyItems: 'start' }}>
        <div style={{ gridArea: '1 / 1' }}>
          <Trail />
        </div>
        <div aria-hidden="true" inert style={{ gridArea: '1 / 1', visibility: 'hidden' }}>
          <Trail />
        </div>
      </div>
    </Renew>
  );
}
