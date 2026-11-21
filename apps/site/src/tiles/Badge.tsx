import { useState } from 'react';
import { Badge, Button, Text } from '@envsemble/envui';
import { IconEditNote } from '@envsemble/envui/icons/EditNote';
import { IconRateReview } from '@envsemble/envui/icons/RateReview';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const states = {
  draft: { tone: 'neutral', label: 'Draft', icon: <IconEditNote /> },
  review: { tone: 'primary', label: 'In review', icon: <IconRateReview /> },
  released: { tone: 'done', label: 'Released', icon: <IconRocketLaunch /> },
} as const;

type State = keyof typeof states;

const action = '.env-button';

const script: PointerStep[] = [
  { wait: 300 },
  { to: action },
  { wait: 240 },
  { click: true },
  { wait: 960 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 360 },
];

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
            <Badge tone={tone} start={icon} style={{ justifySelf: 'start' }}>
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
