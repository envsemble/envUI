import { useEffect, useRef, useState } from 'react';
import { Composer } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const input = '.env-composer-input';

const script: PointerStep[] = [
  { wait: 180 },
  { to: input, x: 0.3 },
  { wait: 150 },
  { click: true },
  { wait: 120 },
  { type: 'Thanks!', into: input, every: 120 },
  { wait: 180 },
  { to: '.env-composer-action', duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 240 },
  { to: input, x: 0.45, duration: 450 },
  { wait: 120 },
  { leave: true },
  { wait: 720 },
];

const simulatedReplyMs = 1300;

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
        timer.current = window.setTimeout(() => setReplying(false), simulatedReplyMs);
      }}
      style={{ inlineSize: narrow ? '8.5rem' : '11rem' }}
    />
  );
}
