import { useState } from 'react';
import { AvatarButton, IconButton, Surface, Text, TopBar } from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { usePointer, type PointerStep } from '../motion/Motion';

const refresh = '.env-top-bar-actions .env-icon-button';

/**
 * Refresh, hovered and pressed: the page progress creeps along the bar's bottom edge, over the
 * page, a while, as a page takes to load, then completes across it and fades, and the page below
 * shows it updated.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: refresh },
  { wait: 400 },
  { click: true },
  { cue: 'load' },
  { wait: 5000 },
  { cue: 'done' },
  { wait: 2400 },
  { leave: true },
  { wait: 500 },
];

/**
 * An application's top bar over the top of its page, filling its card (AppTile.tsx): the title,
 * and the actions at the end, the page under it saying when it was updated.
 */
export default function TopBarTile() {
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  usePointer(script, {
    onCue: (cue) => {
      setLoading(cue === 'load');
      if (cue === 'done') setUpdated(true);
    },
  });
  return (
    <Surface background="page" radius="none" padding={0} style={{ blockSize: '100%' }}>
      <TopBar
        loading={loading}
        title="Reports"
        actions={
          <>
            <IconButton icon={<IconRefresh />} aria-label="Refresh" variant="ghost" />
            <AvatarButton name="Alex Morgan" />
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
