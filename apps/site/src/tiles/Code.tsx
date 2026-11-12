import { CodeBlock } from '@envsemble/envui/code';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const copy = '.env-code-block-header .env-icon-button';

/** Presses its copy button: the icon turns to a check and, a few seconds later, back. */
const script: PointerStep[] = [
  { wait: 180 },
  { to: 'pre', x: 0.6, y: 0.6 },
  { wait: 120 },
  { to: copy, duration: 500 },
  { wait: 210 },
  { click: true },
  { wait: 420 },
  { to: 'pre', x: 0.6, y: 0.6, duration: 450 },
  { wait: 90 },
  { leave: true },
  { wait: 1440 },
];

/** A code block with a command and its copy button. */
export default function CodeTile() {
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  return (
    <CodeBlock
      language="sh"
      label="Terminal"
      copyable
      style={{ inlineSize: narrow ? '10rem' : '11rem' }}
    >
      {'npm run build'}
    </CodeBlock>
  );
}
