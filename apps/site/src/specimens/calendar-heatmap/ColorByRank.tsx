import { CalendarHeatmap, Column, Text, Theme, useTheme } from '@envsemble/envui';
import ColorByRank from '../../examples/calendar-heatmap/ColorByRank';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const { props: exampleHeatmap } = ColorByRank();

function Toggling() {
  const byRank = useTimeline([1320, 1320]) === 1;
  const pageThemeSoColorsEase = useTheme();
  return (
    <Theme {...pageThemeSoColorsEase}>
      <Column gap={3} align="center">
        <Text variant="caption" emphasis="muted">
          {byRank ? 'Steps by rank' : 'Even steps'}
        </Text>
        <CalendarHeatmap
          {...exampleHeatmap}
          thresholds={byRank ? exampleHeatmap.thresholds : undefined}
        />
      </Column>
    </Theme>
  );
}

export default function ColorByRankMotion() {
  return (
    <MotionStage label="the heatmap between even steps and steps by rank">
      <Toggling />
    </MotionStage>
  );
}
