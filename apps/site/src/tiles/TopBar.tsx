import { useState } from 'react';
import { AvatarButton, IconButton, TopBar } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { usePointer, type PointerStep } from '../previews/Motion';

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

/** An application's top bar: back, the title, and the actions at the end. */
export default function TopBarTile() {
  const [loading, setLoading] = useState(false);
  usePointer(script, { onCue: (cue) => setLoading(cue === 'load') });
  return (
    <TopBar
      loading={loading}
      style={{ inlineSize: '16rem' }}
      start={<IconButton icon={<ArrowBack />} aria-label="Back to projects" variant="ghost" />}
      title="Reports"
      actions={
        <>
          <IconButton icon={<Refresh />} aria-label="Refresh" variant="ghost" />
          <AvatarButton name="Alex Morgan" />
        </>
      }
    />
  );
}
