import { useState } from 'react';
import { AvatarButton, IconButton, Surface, Text, TopBar } from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

const refresh = '.env-top-bar-end .env-icon-button';

const script: PointerStep[] = [
  { wait: 180 },
  { to: refresh },
  { wait: 240 },
  { click: true },
  { cue: 'load' },
  { wait: 3000 },
  { cue: 'done' },
  { wait: 1440 },
  { leave: true },
  { wait: 300 },
];

export default function TopBarTile() {
  const narrow = useMedia(narrowGallery);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  usePointer(script, {
    onCue: (cue) => {
      setLoading(cue === 'load');
      if (cue === 'done') setUpdated(true);
    },
  });
  return (
    <Surface
      background="default"
      radius="xl"
      padding={0}
      style={{ inlineSize: narrow ? '10rem' : '13rem', overflow: 'hidden', ...outlined }}
    >
      <TopBar
        loading={loading}
        title="Reports"
        end={
          <>
            <IconButton icon={<IconRefresh />} aria-label="Refresh" variant="ghost" />
            {!narrow && <AvatarButton name="Alex Morgan" />}
          </>
        }
      />
      <Text
        variant="body-sm"
        emphasis="muted"
        style={{ display: 'block', padding: 'var(--env-space-3) var(--env-space-4)' }}
      >
        {updated ? 'Updated just now' : 'Updated 2 hours ago'}
      </Text>
    </Surface>
  );
}
