import { useLayoutEffect, useRef } from 'react';
import { Kbd } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/**
 * The shortcut pressed as a hand presses it: Ctrl goes down, then K, and both come up. How many of
 * its keys are down at each step.
 */
const down = [0, 1, 2, 0];

/*
 * A key has no pressed look of its own, so a key that is down takes a pressed fill and border
 * through the key's own color hooks, --env-kbd-bg and --env-kbd-border.
 */
const pressed = {
  '--env-kbd-bg': 'var(--env-color-bg-neutral-muted-pressed)',
  '--env-kbd-border': 'var(--env-color-border-default)',
};

/** A keyboard shortcut, Ctrl+K. */
export default function KbdTile() {
  const step = useTimeline([900, 450, 650, 900]);
  const keys = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const caps = keys.current?.querySelectorAll<HTMLElement>('.env-kbd') ?? [];
    caps.forEach((cap, index) => {
      for (const [name, value] of Object.entries(pressed))
        if (index < down[step]) cap.style.setProperty(name, value);
        else cap.style.removeProperty(name);
    });
  }, [step]);
  return <Kbd ref={keys} keys={['Ctrl', 'K']} />;
}
