import { useState } from 'react';
import { AvatarButton, IconButton, Surface, Text, TopBar } from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

const refresh = '.env-top-bar-actions .env-icon-button';

/**
 * Hovers and presses Refresh: the page progress creeps along the bar's bottom edge, over the page,
 * for a while, as a page takes to load, then completes across it and fades, and the page below
 * shows that it was updated.
 */
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

/**
 * An application's top bar over the top of its page, as wide as a gallery's tile shows: the title,
 * the actions at the end, and the page below saying when it was updated. Both are on a surface
 * whose edge is drawn, so the progress, along the bar's bottom edge, runs across all of it, between
 * the bar and the page. In a phone's narrower tile the bar keeps only the refresh action, so it is
 * drawn at about its own size there.
 */
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
        actions={
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
