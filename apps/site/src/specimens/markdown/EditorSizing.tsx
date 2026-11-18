import { useEffect, useRef, useState } from 'react';
import { Grid } from '@envsemble/envui';
import { MarkdownEditor } from '@envsemble/envui/markdown';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const agenda = ['- Welcome', '- Roadmap review', '- Budget', '- Hiring plan', '- Questions'];

const scriptFor = (sizing: string): PointerStep[] => [
  { wait: 300 },
  ...agenda.flatMap((line, index): PointerStep[] => [
    { type: `${index ? '\n' : ''}${line}`, into: `[data-editor="${sizing}"] textarea`, every: 70 },
    { wait: 150 },
  ]),
  { wait: 1080 },
  { cue: 'renew' },
  { wait: 360 },
];
const scripts = { fixed: scriptFor('fixed'), content: scriptFor('content') };

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
  useEffect(
    function scrollToTypedLineAsCaretWould() {
      const field = root.current?.querySelector('textarea');
      if (field && sizing === 'fixed') field.scrollTop = field.scrollHeight;
    },
    [text, sizing],
  );
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

export default function EditorSizing() {
  return (
    <SpecimenFrame>
      <MotionStage label="text typed into both editors">
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
