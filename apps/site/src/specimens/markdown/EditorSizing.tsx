import { useEffect, useRef, useState } from 'react';
import { Grid } from '@envsemble/envui';
import { MarkdownEditor } from '@envsemble/envui/markdown';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const agenda = ['- Welcome', '- Roadmap review', '- Budget', '- Hiring plan', '- Questions'];

/*
 * The same agenda is typed into both editors, a line at a time: the editor of a fixed height keeps
 * it and scrolls to the line being typed, and the one that grows with its text gets taller. Both
 * are drawn anew as they began, with a short fade (Renew).
 */
const scriptFor = (sizing: string): PointerStep[] => [
  { wait: 500 },
  ...agenda.flatMap((line, index): PointerStep[] => [
    { type: `${index ? '\n' : ''}${line}`, into: `[data-editor="${sizing}"] textarea`, every: 70 },
    { wait: 250 },
  ]),
  { wait: 1800 },
  { cue: 'renew' },
  { wait: 600 },
];
const scripts = { fixed: scriptFor('fixed'), content: scriptFor('content') };

/** An editor typed into by a keyboard no one sees; the fixed one follows the line typed. */
function Typed({ label, sizing }: { label: string; sizing: 'fixed' | 'content' }) {
  const [round, setRound] = useState(0);
  const [text, setText] = useState('');
  const root = useRef<HTMLDivElement>(null);
  usePointer(scripts[sizing], {
    onCue: () => {
      setRound((count) => count + 1);
      window.setTimeout(() => setText(''), 200);
    },
  });
  // As a browser does as the caret moves down past the field's bottom edge.
  useEffect(() => {
    const field = root.current?.querySelector('textarea');
    if (field && sizing === 'fixed') field.scrollTop = field.scrollHeight;
  }, [text, sizing]);
  return (
    <div ref={root} data-editor={sizing}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <MarkdownEditor
            label={label}
            sizing={sizing}
            rows={3}
            preview={false}
            toolbar={['bold', 'italic', 'link']}
            value={text}
            onValueChange={setText}
          />
        </div>
      </Renew>
    </div>
  );
}

/** Editor sizing: a fixed height beside one that grows, the same agenda typed into both. */
export default function EditorSizing() {
  return (
    <SpecimenFrame>
      <MotionStage label="text typed into both editors">
        {/* As tall as the grown editor from the start, the editors at its top. */}
        <Grid
          columns={2}
          gap={6}
          align="start"
          style={{ inlineSize: 'min(100%, 40rem)', minBlockSize: '17rem' }}
        >
          <Typed label="Fixed height" sizing="fixed" />
          <Typed label="Grows with its text" sizing="content" />
        </Grid>
      </MotionStage>
    </SpecimenFrame>
  );
}
