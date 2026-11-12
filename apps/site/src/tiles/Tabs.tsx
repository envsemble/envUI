import { useState } from 'react';
import { IconButton, Row, Tabs, Text } from '@envsemble/envui';
import { IconUpload } from '@envsemble/envui/icons/Upload';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

/** Chooses Files, the indicator and the panel following, then Plan again. */
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

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 15, height: 11.25 };

/**
 * Three tabs of a project, with Plan chosen, above its panel, filling a box as tall as the tallest
 * panel, as tabs in a pane do, so the strip stays in place as the panels change. The component
 * fades the old panel out as the new one fades in, in the same place. Both panels the tile moves
 * between start at the panel's start, as a pane's content does: Plan is a short line, and Files its
 * count beside its upload button. Its labels are the same at every width. In a phone's narrower and
 * lower tile the strip is a little wider than the stage shows at its own size, so it is drawn at
 * the one smaller scale that the other navigation tiles there take, with its panels whole and
 * apart.
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
