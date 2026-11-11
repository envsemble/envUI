import { useState } from 'react';
import { Badge, Button, Text } from '@envsemble/envui';
import { IconEditNote } from '@envsemble/envui/icons/EditNote';
import { IconRateReview } from '@envsemble/envui/icons/RateReview';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

/*
 * A piece of work's states, each with its tone.
 */
const states = {
  draft: { tone: 'neutral', label: 'Draft', icon: <IconEditNote /> },
  review: { tone: 'primary', label: 'In review', icon: <IconRateReview /> },
  released: { tone: 'done', label: 'Released', icon: <IconRocketLaunch /> },
} as const;

type State = keyof typeof states;

const action = '.env-button';

/** Releases the work in review with its button, then reopens it, as it began. */
const script: PointerStep[] = [
  { wait: 500 },
  { to: action },
  { wait: 400 },
  { click: true },
  { wait: 1600 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 600 },
];

/**
 * Two pieces of work, each with a badge naming its state in its tone. A badge shows the state it is
 * given, so it changes only when the state does: here when the work in review is released with a
 * button below them, and reopened. Its labels are short and the same at every width. In a phone's
 * narrower tile they sit closer to their badges, so the tile is drawn at about its own size there.
 */
export default function BadgeTile() {
  const narrow = useMedia(narrowGallery);
  const [launch, setLaunch] = useState<State>('review');
  usePointer(script);
  const work = [
    { name: 'Launch', state: launch },
    { name: 'Pricing', state: 'draft' },
  ] as const;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        alignItems: 'center',
        columnGap: narrow ? 'var(--env-space-3)' : 'var(--env-space-6)',
        rowGap: 'var(--env-space-3)',
      }}
    >
      {work.map(({ name, state }) => {
        const { tone, label, icon } = states[state];
        return (
          <div key={name} style={{ display: 'contents' }}>
            <Text>{name}</Text>
            <Badge tone={tone} icon={icon} style={{ justifySelf: 'start' }}>
              {label}
            </Badge>
          </div>
        );
      })}
      <Button
        size="sm"
        variant="outline"
        style={{ gridColumn: '1 / -1', justifySelf: 'start' }}
        onClick={() => setLaunch(launch === 'review' ? 'released' : 'review')}
      >
        {launch === 'review' ? 'Release Launch' : 'Reopen Launch'}
      </Button>
    </div>
  );
}
