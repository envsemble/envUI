import { useEffect, useRef, useState } from 'react';
import { Composer } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';
import { narrowGallery } from './Tiles';

const input = '.env-composer-input';

/**
 * Clicked into, a message typed and sent: the field clears and, while the reply comes, the send
 * button is a stop button; then it is a send button again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: input, x: 0.3 },
  { wait: 250 },
  { click: true },
  { wait: 200 },
  { type: 'Thanks!', into: input, every: 120 },
  { wait: 300 },
  { to: '.env-composer-action', duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 400 },
  { to: input, x: 0.45, duration: 450 },
  { wait: 200 },
  { leave: true },
  { wait: 1200 },
];

/** A composer with its placeholder and its send button. */
export default function ComposerTile() {
  const narrow = useMedia(narrowGallery);
  const [replying, setReplying] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  usePointer(script);
  return (
    <Composer
      aria-label="Message"
      placeholder="Message"
      running={replying}
      onStop={() => setReplying(false)}
      onSend={() => {
        setReplying(true);
        // A timer stands in for the reply.
        timer.current = window.setTimeout(() => setReplying(false), 1300);
      }}
      style={{ inlineSize: narrow ? '8.5rem' : '11rem' }}
    />
  );
}
