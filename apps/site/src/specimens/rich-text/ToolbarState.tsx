import { RichTextEditor } from '@envsemble/envui/rich-text';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const notes = 'Send the **press kit** to Priya Shah by Friday.';
const document = '.ProseMirror';

/*
 * The pointer selects "press kit", which is bold, and Bold shows pressed; it presses in the plain
 * text at the end of the line, and Bold lets go.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: `${document} strong`, x: 0.02, y: 0.55 },
  { wait: 300 },
  { press: true },
  { to: `${document} strong`, x: 0.98, y: 0.55, duration: 700 },
  { release: true },
  { wait: 1500 },
  { to: `${document} p`, x: 0.97, y: 0.5, duration: 700 },
  { wait: 200 },
  { click: true },
  { wait: 1500 },
  { leave: true },
  { wait: 400 },
  { blur: true },
  { wait: 600 },
];

function Formatting() {
  usePointer(script);
  return (
    <RichTextEditor
      label="Launch notes"
      defaultValue={notes}
      toolbar={['bold', 'italic', 'link']}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}

/** Bold pressed while the caret is in bold text, and let go in plain text. */
export default function ToolbarStateMotion() {
  return (
    <Example>
      <MotionStage label="Bold pressed in bold text">
        <Formatting />
      </MotionStage>
    </Example>
  );
}
