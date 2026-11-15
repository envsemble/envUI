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

const sixteenWeeksInDays = 112;

const sixteenWeeksOfEdits: CalendarHeatmapDay[] = Array.from(
  { length: sixteenWeeksInDays },
  (_, index) => {
    const weekday = (index + 1) % 7;
    const isWeekend = weekday === 0 || weekday === 6;
    const wave = Math.sin(index / 6) + Math.sin((index * 3) / 11) + 1.4;
    const value = Math.max(0, Math.round(wave * 2.4 * (isWeekend ? 0.35 : 1)));
    return {
      date: new Date(Date.UTC(2026, 0, 4) + index * 86_400_000).toISOString().slice(0, 10),
      value,
      label: `${value} ${value === 1 ? 'edit' : 'edits'}`,
    };
  },
);

const looks: { tone: CalendarHeatmapProps['tone']; levels: number; name: string }[] = [
  { tone: 'primary', levels: 5, name: 'Primary, 5 steps' },
  { tone: 'success', levels: 5, name: 'Success, 5 steps' },
  { tone: 'warning', levels: 5, name: 'Warning, 5 steps' },
  { tone: 'danger', levels: 5, name: 'Danger, 5 steps' },
  { tone: 'primary', levels: 2, name: 'Primary, 2 steps' },
  { tone: 'primary', levels: 10, name: 'Primary, 10 steps' },
];
const steps = looks.map(() => 1020);

function Stepping() {
  const step = useTimeline(steps);
  const look = looks[step];
  const pageThemeSoColorsEase = useTheme();
  return (
    <Theme {...pageThemeSoColorsEase}>
      <Column gap={3} align="center">
        <Text variant="caption" emphasis="muted">
          {look.name}
        </Text>
        <CalendarHeatmap
          aria-label="Edits in sixteen weeks"
          data={sixteenWeeksOfEdits}
          tone={look.tone}
          levels={look.levels}
        />
      </Column>
    </Theme>
  );
}

export default function TonesAndSteps() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the heatmap through its tones and color steps">
        <Stepping />
      </MotionStage>
    </SpecimenFrame>
  );
}
