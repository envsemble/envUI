import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';
import { SpecimenFrame, SpecimenGrid, SpecimenPart } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const statuses = [
  { value: 'open', label: 'Open', count: 12 },
  { value: 'blocked', label: 'Blocked', count: 3 },
  { value: 'done', label: 'Done', count: 40 },
];
const ignore = () => undefined;

const segment = (label: string, index: number) =>
  `[aria-label="${label}"] .env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/*
 * The pointer chooses List, whose check takes its icon's place as Board gets its icon back, and
 * then Board again. The keyboard's focus arrives on Day, and the arrow key goes on to Week and
 * then past the disabled Quarter, back round to Day, each key shown as a cap in the stage's corner.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: segment('Layout', 1), x: 0.55, y: 0.6 },
  { wait: 450 },
  { click: true },
  { wait: 1100 },
  { to: segment('Layout', 2), x: 0.5, y: 0.6, duration: 450 },
  { wait: 350 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 500 },
  { cue: 'Tab' },
  { focus: segment('Period', 1) },
  { wait: 900 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 1000 },
  { cue: '→' },
  { key: 'ArrowRight' },
  { wait: 1000 },
  { cue: 'none' },
  { blur: true },
  { wait: 900 },
];

function Choosing() {
  const [layout, setLayout] = useState('board');
  const [period, setPeriod] = useState('day');
  // The key just pressed, as a cap in the stage's corner, since no pointer shows it.
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(script, {
    onCue: (cue) =>
      setPressed((last) =>
        cue === 'none' ? null : { keys: [cue], press: (last?.press ?? 0) + 1 },
      ),
  });
  return (
    <SpecimenGrid>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <SpecimenPart title="With counts">
        <SegmentedControl
          aria-label="Work items"
          value="open"
          onValueChange={ignore}
          items={statuses}
        />
      </SpecimenPart>
      <SpecimenPart title="With icons">
        <SegmentedControl
          aria-label="Layout"
          value={layout}
          onValueChange={setLayout}
          items={[
            { value: 'list', label: 'List', icon: <IconViewList /> },
            { value: 'board', label: 'Board', icon: <IconViewModule /> },
          ]}
        />
      </SpecimenPart>
      <SpecimenPart title="A disabled option">
        <SegmentedControl
          aria-label="Period"
          value={period}
          onValueChange={setPeriod}
          items={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'quarter', label: 'Quarter', disabled: true },
          ]}
        />
      </SpecimenPart>
      <SpecimenPart title="Disabled">
        <SegmentedControl
          aria-label="Work items, unavailable"
          value="blocked"
          onValueChange={ignore}
          items={statuses}
          disabled
        />
      </SpecimenPart>
    </SpecimenGrid>
  );
}

/**
 * Counts, icons, a disabled option and a disabled control: the pointer chooses an option with an
 * icon, and the arrow keys skip the disabled one.
 */
export default function States() {
  return (
    <SpecimenFrame size="collection">
      <MotionStage label="choosing an option, and the arrow keys skipping a disabled one">
        <Choosing />
      </MotionStage>
    </SpecimenFrame>
  );
}
