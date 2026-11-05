import { useState } from 'react';
import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { usePointer, type PointerStep } from '../motion/Motion';

const refresh = '.env-top-bar-actions .env-icon-button';

/** Refresh, hovered and pressed: the page progress runs along the bar's bottom edge and ends. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: refresh },
  { wait: 600 },
  { click: true },
  { cue: 'load' },
  { wait: 1700 },
  { cue: 'done' },
  { wait: 700 },
  { leave: true },
  { wait: 600 },
];

/** An application's top bar, as wide as a gallery's tile shows: the title, and the actions at the end. */
export default function TopBarTile() {
  const [loading, setLoading] = useState(false);
  usePointer(script, { onCue: (cue) => setLoading(cue === 'load') });
  return (
    <TopBar
      loading={loading}
      style={{ inlineSize: '12.5rem' }}
      title="Reports"
      actions={
        <>
          <IconButton icon={<IconRefresh />} aria-label="Refresh" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
