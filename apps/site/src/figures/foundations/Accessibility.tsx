import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Checkbox, Column, IconButton, Kbd, Row, TextField } from '@envsemble/envui';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import type { FoundationFigureEntry } from './FoundationFigures';
import { CornerLabel } from './Steps';
import { FoundationFrame } from './FoundationFrame';

/*
 * The figures of the Accessibility foundation. Its words are in docs/foundations/accessibility.md,
 * the page's one source, which places each figure by name and gives it its caption.
 */

/**
 * The marks the pointer no one sees gives what holds focus, which the site's :focus-visible and
 * :focus-within rules follow (KeyboardControl.ts): an animated figure is inert, so it can't hold
 * real focus.
 */
const focusMark = 'data-catalogue-focus';
const focusWithinMark = 'data-catalogue-focus-within';

/** The keys pressed, in order, and the names their key caps show. */
const keyNames = { tab: ['Tab'], back: ['Shift', 'Tab'], space: ['Space'] } as const;
type Press = keyof typeof keyNames;

/**
 * The keyboard moves through the form on its own: Tab into the title, Tab to the checkbox, Space
 * unticks it and ticks it again, Tab on through More, Cancel and Save, then Shift+Tab back to the
 * title and out of the form, where it began.
 */
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
  { wait: 900 },
  ...presses.flatMap((press, index): PointerStep[] => [
    { cue: press },
    { wait: press === 'space' || presses[index + 1] === 'space' ? 1000 : 1150 },
  ]),
  { cue: 'done' },
  { wait: 900 },
];

/** A small form the keyboard moves through, its focus ring walking, with each key named. */
function KeyboardSteps() {
  const form = useRef<HTMLDivElement>(null);
  // Where focus is, by its place among the form's controls, or -1 outside the form.
  const [at, setAt] = useState(-1);
  const [shared, setShared] = useState(true);
  // The key pressed last, and how many keys so far, so its cap is pressed again each time.
  const [key, setKey] = useState<{ press: Press; count: number } | null>(null);
  usePointer(keyboardScript, {
    onCue: (cue) => {
      if (cue === 'done') {
        setKey(null);
        setAt(-1);
        return;
      }
      // Its script cues only the keys it presses, and that it is done (keyboardScript).
      const press = cue as Press;
      setKey((last) => ({ press, count: (last?.count ?? 0) + 1 }));
      if (press === 'space') setShared((checked) => !checked);
      else setAt((place) => (press === 'tab' ? place + 1 : place - 1));
    },
  });
  // The control at `at` shows its focus ring, and what holds it shows focus within.
  useLayoutEffect(() => {
    const root = form.current;
    if (!root) return;
    const control = at < 0 ? null : root.querySelectorAll('input, button')[at];
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
  }, [at]);
  return (
    <>
      {key && (
        <CornerLabel>
          <Kbd key={key.count} keys={keyNames[key.press]} className="catalogue-key-cap" />
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

/** A small form the keyboard moves through on its own: the focus ring shows where it is. */
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

/** The figures docs/foundations/accessibility.md places, by name. */
export const accessibilityFigures: Record<string, FoundationFigureEntry> = {
  Keyboard: { render: KeyboardFigure },
};
