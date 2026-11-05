import { useState } from 'react';
import { Column, Tabs, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

/** Files chosen, then Activity, the indicator and the panel following, and Summary again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: tab(2) },
  { wait: 400 },
  { click: true },
  { wait: 1000 },
  { to: tab(3), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 1000 },
  { to: tab(1), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/**
 * Each panel a different shape, as views of a project are: a line, two files, and a longer line
 * over a shorter one, so a change of panel reads as one, though the component fades the panel
 * leaving out as the one coming fades in, in the same place.
 */
const panels = [
  {
    value: 'summary',
    label: 'Summary',
    short: 'Plan',
    lines: ['Plans and owners.'],
    shortLines: ['Plans and owners.'],
  },
  {
    value: 'files',
    label: 'Files',
    short: 'Files',
    lines: ['brief.pdf', 'budget.xlsx'],
    shortLines: ['Two files.'],
  },
  {
    value: 'activity',
    label: 'Activity',
    short: 'Log',
    lines: ['Sam edited the brief.', 'Updated today.'],
    shortLines: ['Edited today.'],
  },
];

/**
 * Three tabs of a project, Summary chosen, over its panel, filling a box of the height of the
 * tallest panel, as tabs in a pane do, so the strip stays where it is as the panels change.
 * In a phone's narrower and lower tile the tabs take shorter names and the panels a line each, of
 * different lengths, so the strip is drawn at about its own size there and its panels show whole.
 */
export default function TabsTile() {
  const narrow = useMedia(narrowGallery);
  const [value, setValue] = useState('summary');
  usePointer(script);
  return (
    <Tabs
      aria-label="Project views"
      fill
      style={{ blockSize: '6.5rem' }}
      value={value}
      onValueChange={(next) => next && setValue(next)}
      items={panels.map((panel) => ({
        value: panel.value,
        label: narrow ? panel.short : panel.label,
        content: (
          <Column gap={1}>
            {(narrow ? panel.shortLines : panel.lines).map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </Column>
        ),
      }))}
    />
  );
}
