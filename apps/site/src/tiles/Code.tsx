import { CodeBlock } from '@envsemble/envui/content';
import { usePointer, type PointerStep } from '../motion/Motion';

const copy = '.env-code-block-header .env-icon-button';

/** Its copy button pressed: the icon turns to a check and, a few seconds later, back. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: 'pre', x: 0.6, y: 0.6 },
  { wait: 200 },
  { to: copy, duration: 500 },
  { wait: 350 },
  { click: true },
  { wait: 700 },
  { to: 'pre', x: 0.6, y: 0.6, duration: 450 },
  { wait: 150 },
  { leave: true },
  { wait: 2400 },
];

/** A code block with a command and its copy button. */
export default function CodeTile() {
  usePointer(script);
  return (
    <CodeBlock language="sh" label="Terminal" copyable style={{ inlineSize: '11rem' }}>
      {'npm run build'}
    </CodeBlock>
  );
}
