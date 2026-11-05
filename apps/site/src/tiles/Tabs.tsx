import { useState } from 'react';
import { IconButton, Row, Tabs, Text } from '@envsemble/envui';
import { IconUpload } from '@envsemble/envui/icons/Upload';
import { usePointer, type PointerStep } from '../motion/Motion';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

/** Files chosen, the indicator and the panel following, and Plan again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: tab(2) },
  { wait: 400 },
  { click: true },
  { wait: 1600 },
  { to: tab(1), duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 2500 },
];

/**
 * Three tabs of a project, Plan chosen, over its panel, filling a box of the height of the tallest
 * panel, as tabs in a pane do, so the strip stays where it is as the panels change. The component
 * fades the panel leaving out as the one coming fades in, in the same place, so the two panels the
 * card moves between hold their content apart: Plan a short line at the start, Files its upload
 * button at the end. Its names are short, the same at every width, so the strip is drawn at about
 * its own size in a phone's narrower and lower tile too, its panels whole and apart.
 */
export default function TabsTile() {
  const [value, setValue] = useState('summary');
  usePointer(script);
  return (
    <Tabs
      aria-label="Project views"
      fill
      style={{ blockSize: '6.5rem' }}
      value={value}
      onValueChange={(next) => next && setValue(next)}
      items={[
        {
          value: 'summary',
          label: 'Plan',
          content: <Text>Due in May.</Text>,
        },
        {
          value: 'files',
          label: 'Files',
          content: (
            <Row gap={2} justify="end" align="center">
              <IconButton
                size="sm"
                variant="ghost"
                icon={<IconUpload />}
                aria-label="Upload a file"
              />
            </Row>
          ),
        },
        {
          value: 'activity',
          label: 'Log',
          content: <Text>Sam edited the brief.</Text>,
        },
      ]}
    />
  );
}
