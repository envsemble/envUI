import { useState } from 'react';
import {
  AnimatedNumber,
  Badge,
  Column,
  Grid,
  Row,
  SegmentedControl,
  Surface,
  Text,
} from '@envsemble/envui';
import { IconTrendingDown } from '@envsemble/envui/icons/TrendingDown';
import { IconTrendingUp } from '@envsemble/envui/icons/TrendingUp';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { outlined } from './Outline';
import type { TileWindow } from './Tiles';

const periods = {
  week: { lead: 2.5, faster: 0.5, done: 42, more: 6 },
  month: { lead: 3.1, faster: 0.8, done: 168, more: 21 },
} as const;

const segment = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/** Chooses the month, the figures rolling to it, then the week again. */
const script: PointerStep[] = [
  { wait: 240 },
  { to: segment(2) },
  { wait: 240 },
  { click: true },
  { wait: 1140 },
  { to: segment(1), duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 840 },
  { leave: true },
  { wait: 240 },
];

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 18, height: 13.5 };

/** Two key figures on a surface, with how each changed over the chosen period. */
export default function KeyFiguresTile() {
  const [period, setPeriod] = useState<keyof typeof periods>('week');
  usePointer(script);
  const figures = periods[period];
  return (
    <Surface padding={5} style={{ ...outlined, inlineSize: '17rem' }}>
      <Column gap={4}>
        <SegmentedControl
          aria-label="Period"
          size="sm"
          value={period}
          onValueChange={(value) => setPeriod(value as keyof typeof periods)}
          items={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
        <Grid columns={2} gap={5}>
          <Column gap={1}>
            <Text variant="body-sm" emphasis="muted">
              Lead time
            </Text>
            <Text variant="headline" render={<span />}>
              <AnimatedNumber
                value={figures.lead}
                formatValue={(value) => `${value.toFixed(1)} days`}
              />
            </Text>
            <Row>
              <Badge tone="success" icon={<IconTrendingDown />}>
                {`${figures.faster} faster`}
              </Badge>
            </Row>
          </Column>
          <Column gap={1}>
            <Text variant="body-sm" emphasis="muted">
              Tasks done
            </Text>
            <Text variant="headline" render={<span />}>
              <AnimatedNumber value={figures.done} />
            </Text>
            <Row>
              <Badge tone="primary" icon={<IconTrendingUp />}>
                {`${figures.more} more`}
              </Badge>
            </Row>
          </Column>
        </Grid>
      </Column>
    </Surface>
  );
}
