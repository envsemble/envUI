import { useState, type ReactNode } from 'react';
import { Button, Column, IconButton, Tabs, Text } from '@envsemble/envui';
import { IconUpload } from '@envsemble/envui/icons/Upload';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const tallestPanelHeight = '8.75rem';

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

const script: PointerStep[] = [
  { wait: 300 },
  { cue: 'Tab' },
  { focus: '.env-tabs-tab[aria-selected="true"]' },
  { wait: 540 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 540 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 540 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 720 },
  { cue: '←' },
  { key: 'ArrowLeft' },
  { wait: 300 },
  { cue: '←' },
  { key: 'ArrowLeft' },
  { wait: 300 },
  { cue: '←' },
  { key: 'ArrowLeft' },
  { wait: 540 },
  { cue: 'none' },
  { blur: true },
  { wait: 480 },
];

function Choosing() {
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
        style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: tallestPanelHeight }}
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

export default function ChoosingATab() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the arrow keys choosing tabs">
        <Choosing />
      </MotionStage>
    </SpecimenFrame>
  );
}
