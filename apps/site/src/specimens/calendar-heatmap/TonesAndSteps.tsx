import {
  CalendarHeatmap,
  Column,
  Text,
  Theme,
  useTheme,
  type CalendarHeatmapDay,
  type CalendarHeatmapProps,
} from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

/** Stands in for sixteen weeks of edits: busier midweek, with a quiet stretch. */
const data: CalendarHeatmapDay[] = Array.from({ length: 112 }, (_, index) => {
  const weekday = (index + 1) % 7;
  const wave = Math.sin(index / 6) + Math.sin((index * 3) / 11) + 1.4;
  const value = Math.max(0, Math.round(wave * 2.4 * (weekday === 0 || weekday === 6 ? 0.35 : 1)));
  return {
    date: new Date(Date.UTC(2026, 0, 4) + index * 86_400_000).toISOString().slice(0, 10),
    value,
    label: `${value} ${value === 1 ? 'edit' : 'edits'}`,
  };
});

/** The tones in turn at five steps, then the primary at two and at ten. */
const looks: { tone: CalendarHeatmapProps['tone']; levels: number; name: string }[] = [
  { tone: 'primary', levels: 5, name: 'Primary, 5 steps' },
  { tone: 'success', levels: 5, name: 'Success, 5 steps' },
  { tone: 'warning', levels: 5, name: 'Warning, 5 steps' },
  { tone: 'danger', levels: 5, name: 'Danger, 5 steps' },
  { tone: 'primary', levels: 2, name: 'Primary, 2 steps' },
  { tone: 'primary', levels: 10, name: 'Primary, 10 steps' },
];
const steps = looks.map(() => 1700);

function Stepping() {
  const step = useTimeline(steps);
  const look = looks[step];
  return (
    // A theme of its own, the page's, so the colors ease from one look to the next.
    <Theme {...useTheme()}>
      <Column gap={3} align="center">
        <Text variant="caption" emphasis="muted">
          {look.name}
        </Text>
        <CalendarHeatmap
          aria-label="Edits in sixteen weeks"
          data={data}
          tone={look.tone}
          levels={look.levels}
        />
      </Column>
    </Theme>
  );
}

/** One heatmap through the tones, then from two color steps to ten. */
export default function TonesAndSteps() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the heatmap through its tones and color steps">
        <Stepping />
      </MotionStage>
    </SpecimenFrame>
  );
}
