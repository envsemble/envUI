import { useLayoutEffect, useRef } from 'react';
import { Kbd, Text } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/** A few of an application's shortcuts, each named beside its keys. */
const shortcuts = [
  { label: 'Search', keys: ['Ctrl', 'K'] },
  { label: 'Save', keys: ['Ctrl', 'S'] },
  { label: 'New file', keys: ['Ctrl', 'N'] },
];

/**
 * Each shortcut pressed in turn, as a hand presses it: Ctrl goes down, then the letter, and both
 * come up. At each step, the shortcut pressed and how many of its keys are down.
 */
const steps = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 0],
  [1, 1],
  [1, 2],
  [1, 0],
] as const;

/*
 * A key has no pressed look of its own, so a key that is down takes a pressed fill and border
 * through the key's own color hooks, --env-kbd-bg and --env-kbd-border.
 */
const pressed = {
  '--env-kbd-bg': 'var(--env-color-bg-neutral-muted-pressed)',
  '--env-kbd-border': 'var(--env-color-border-default)',
};

/** A short list of shortcuts: what each does, and its keys. */
export default function KbdTile() {
  const step = useTimeline([900, 350, 650, 450, 350, 650, 700]);
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const [row, down] = steps[step]!;
    list.current?.querySelectorAll<HTMLElement>('.env-kbd-combination').forEach((shortcut, index) =>
      shortcut.querySelectorAll<HTMLElement>('.env-kbd').forEach((cap, key) => {
        for (const [name, value] of Object.entries(pressed))
          if (index === row && key < down) cap.style.setProperty(name, value);
          else cap.style.removeProperty(name);
      }),
    );
  }, [step]);
  return (
    <div
      ref={list}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        alignItems: 'center',
        columnGap: 'var(--env-space-6)',
        rowGap: 'var(--env-space-3)',
      }}
    >
      {shortcuts.map(({ label, keys }) => (
        <div key={label} style={{ display: 'contents' }}>
          <Text emphasis="muted">{label}</Text>
          <Kbd keys={keys} style={{ justifySelf: 'end' }} />
        </div>
      ))}
    </div>
  );
}
