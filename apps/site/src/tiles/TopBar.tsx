import { useState } from 'react';
import { AvatarButton, IconButton, Surface, Text, TopBar } from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

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
 * An application's top bar over the top of its page, as wide as a gallery's tile shows: the title,
 * and the actions at the end, the page under it saying when it was updated. Both are on a surface
 * whose edge is drawn, so the progress, along the bar's bottom edge, runs across the whole of it,
 * between the bar and the page. In a phone's narrower tile the bar keeps only the refresh, so it
 * is drawn at about its own size there.
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
