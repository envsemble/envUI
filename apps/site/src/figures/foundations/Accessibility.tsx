import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Checkbox, Column, IconButton, Kbd, Row, TextField } from '@envsemble/envui';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import type { FoundationFigureEntry } from './FoundationFigures';
import { CornerLabel } from './Steps';
import { FoundationFrame } from './FoundationFrame';

const focusMark = 'data-catalogue-focus';
const focusWithinMark = 'data-catalogue-focus-within';

const keyNames = { tab: ['Tab'], back: ['Shift', 'Tab'], space: ['Space'] } as const;
type Press = keyof typeof keyNames;

const presses: readonly Press[] = [
  'tab',
  'tab',
  'space',
  'space',
  'tab',
  'tab',
  'tab',
  'back',
  'back',
  'back',
  'back',
  'back',
];
const keyboardScript: PointerStep[] = [
  { wait: 540 },
  ...presses.flatMap((press, index): PointerStep[] => [
    { cue: press },
    { wait: press === 'space' || presses[index + 1] === 'space' ? 600 : 690 },
  ]),
  { cue: 'done' },
  { wait: 540 },
];

function KeyboardSteps() {
  const form = useRef<HTMLDivElement>(null);
  const [focusedControlIndex, setFocusedControlIndex] = useState(-1);
  const [shared, setShared] = useState(true);
  const [key, setKey] = useState<{ press: Press; pressesSoFar: number } | null>(null);
  usePointer(keyboardScript, {
    onCue: (cue) => {
      if (cue === 'done') {
        setKey(null);
        setFocusedControlIndex(-1);
        return;
      }
      const press = cue as Press;
      setKey((last) => ({ press, pressesSoFar: (last?.pressesSoFar ?? 0) + 1 }));
      if (press === 'space') setShared((checked) => !checked);
      else setFocusedControlIndex((place) => (press === 'tab' ? place + 1 : place - 1));
    },
  });
  useLayoutEffect(() => {
    const root = form.current;
    if (!root) return;
    const control =
      focusedControlIndex < 0 ? null : root.querySelectorAll('input, button')[focusedControlIndex];
    if (!control) return;
    const marked: Element[] = [];
    control.setAttribute(focusMark, '');
    for (
      let node = control.parentElement;
      node && node !== root.parentElement;
      node = node.parentElement
    ) {
      node.setAttribute(focusWithinMark, '');
      marked.push(node);
    }
    return () => {
      control.removeAttribute(focusMark);
      for (const node of marked) node.removeAttribute(focusWithinMark);
    };
  }, [focusedControlIndex]);
  return (
    <>
      {key && (
        <CornerLabel>
          <Kbd key={key.pressesSoFar} keys={keyNames[key.press]} className="catalogue-key-cap" />
        </CornerLabel>
      )}
      <Column ref={form} gap={4} className="catalogue-keyboard-sample">
        <TextField label="Report title" defaultValue="Quarterly report" />
        <Checkbox label="Share with the team" checked={shared} onCheckedChange={setShared} />
        <Row gap={2} justify="end" align="center">
          <IconButton variant="ghost" icon={<IconMoreVert />} aria-label="More options" />
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </Row>
      </Column>
    </>
  );
}

function KeyboardFigure({ caption }: { caption?: string }) {
  return (
    <FoundationFrame
      label="Move through a form with the keyboard"
      motion="the keyboard moving through the form"
      caption={caption}
    >
      <KeyboardSteps />
    </FoundationFrame>
  );
}

export const accessibilityFigures: Record<string, FoundationFigureEntry> = {
  Keyboard: { render: KeyboardFigure },
};
