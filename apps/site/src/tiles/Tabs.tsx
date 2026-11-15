import { useState } from 'react';
import { IconButton, Row, Tabs, Text } from '@envsemble/envui';
import { IconUpload } from '@envsemble/envui/icons/Upload';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

const script: PointerStep[] = [
  { wait: 180 },
  { to: tab(2) },
  { wait: 240 },
  { click: true },
  { wait: 960 },
  { to: tab(1), duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 1500 },
];

export const tileWindow: TileWindow = { width: 15, height: 11.25 };

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
            <Row gap={2} align="center">
              <Text emphasis="muted">2 files</Text>
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
          label: 'Activity',
          content: <Text>Sam edited the brief.</Text>,
        },
      ]}
    />
  );
}
