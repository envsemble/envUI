import { useEffect, useRef, useState } from 'react';
import { Button, Theme, TextField } from '@envsemble/envui';
import { useMediaQuery } from '../../packages/ui/src/internal/useMediaQuery.js';
import { useShortcut } from '../../packages/ui/src/internal/useShortcut.js';

/** A button that a shortcut presses while it is shown, as a search trigger would. */
function ShortcutButton({ label, onPress }: { label: string; onPress: (label: string) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useShortcut('mod+k', () => onPress(label), { element: ref });
  return (
    <Button ref={ref} variant="secondary" onClick={() => onPress(label)}>
      {label}
    </Button>
  );
}

export function ResponsiveHooksFixture() {
  const wide = useMediaQuery('(width >= 48rem)');
  const portrait = useMediaQuery('(orientation: portrait)');
  const [pressed, setPressed] = useState<string[]>([]);
  const [second, setSecond] = useState(true);
  const press = (label: string) => setPressed((labels) => [...labels, label]);
  useShortcut('mod+b', () => press('bold shortcut'));
  // A parent's effects run after its children's: once this one has, every shortcut is registered.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <Theme theme="light" className="fixture-section" data-ready={ready || undefined}>
      <output data-testid="breakpoint">{wide ? 'md and up' : 'below md'}</output>
      <output data-testid="orientation">{portrait ? 'portrait' : 'landscape'}</output>
      <TextField label="Notes" />
      <ShortcutButton label="First search" onPress={press} />
      <div hidden={!second}>
        <ShortcutButton label="Second search" onPress={press} />
      </div>
      <Button variant="secondary" onClick={() => setSecond((shown) => !shown)}>
        Toggle the second search
      </Button>
      <output data-testid="pressed">{pressed.join(', ')}</output>
    </Theme>
  );
}
