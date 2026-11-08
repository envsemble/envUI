import { useState, type ReactNode } from 'react';
import { Button, Column, IconButton, Tabs, Text } from '@envsemble/envui';
import { IconUpload } from '@envsemble/envui/icons/Upload';
import { Example } from '../../figures/Example';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

/*
 * Tabs fade the panel leaving out as the one coming fades in, in the same place, so panels next to
 * each other along the rail hold their content apart: Summary and Activity a short line at the top,
 * Files its upload button at the top's end and its files below.
 */
const views: { value: string; label: string; content: ReactNode }[] = [
  { value: 'summary', label: 'Summary', content: <Text>The launch plan and its budget.</Text> },
  {
    value: 'files',
    label: 'Files',
    content: (
      <Column gap={1}>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<IconUpload />}
          aria-label="Upload a file"
          style={{ alignSelf: 'end' }}
        />
        <Text>Launch plan.pdf</Text>
        <Text>Budget 2026.xlsx</Text>
      </Column>
    ),
  },
  { value: 'activity', label: 'Activity', content: <Text>Priya updated the plan today.</Text> },
  { value: 'reports', label: 'Reports', content: <Text>Reports open after a week of data.</Text> },
];

/*
 * The keyboard's focus enters the rail on the chosen tab; the right arrow key moves it tab by tab,
 * each showing its panel at once, and on to the disabled Reports, which it reaches but doesn't
 * choose; the left arrow key goes back to Summary, and focus moves on. Each key shows as a cap in
 * the stage's corner as it is pressed (PressedKeys).
 */
const script: PointerStep[] = [
  { wait: 500 },
  { cue: 'Tab' },
  { focus: '.env-tabs-tab[aria-selected="true"]' },
  { wait: 900 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 900 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 900 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 1200 },
  { cue: '←' },
  { key: 'ArrowLeft' },
  { wait: 500 },
  { cue: '←' },
  { key: 'ArrowLeft' },
  { wait: 500 },
  { cue: '←' },
  { key: 'ArrowLeft' },
  { wait: 900 },
  { cue: 'none' },
  { blur: true },
  { wait: 800 },
];

function Choosing() {
  // The key just pressed, as a cap in the stage's corner, since no pointer shows it.
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(script, {
    onCue: (cue) =>
      setPressed((last) =>
        cue === 'none' ? null : { keys: [cue], press: (last?.press ?? 0) + 1 },
      ),
  });
  return (
    <>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <Tabs
        aria-label="Project views"
        // As tall as the tallest panel, Files, so the rail stays where it is as the panels change.
        style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: '8.75rem' }}
        items={views.map(({ value, label, content }) => ({
          value,
          button: <Button>{label}</Button>,
          disabled: value === 'reports',
          content,
        }))}
      />
    </>
  );
}

/** Tabs chosen with the arrow keys: each panel at once, and a disabled tab reached, not chosen. */
export default function ChoosingATab() {
  return (
    <Example size="content">
      <MotionStage label="the arrow keys choosing tabs">
        <Choosing />
      </MotionStage>
    </Example>
  );
}
