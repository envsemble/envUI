import { CalendarHeatmap, Column, Text, Theme, useTheme } from '@envsemble/envui';
import ColorByRank from '../../examples/calendar-heatmap/ColorByRank';
import { useTimeline } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

// The example's heatmap, whose data and thresholds the figure toggles.
const { props: example } = ColorByRank();

function Toggling() {
  const byRank = useTimeline([2200, 2200]) === 1;
  return (
    // A theme of its own, the page's, so the colors ease between the two.
    <Theme {...useTheme()}>
      <Column gap={3} align="center">
        <Text variant="caption" emphasis="muted">
          {byRank ? 'Steps by rank' : 'Even steps'}
        </Text>
        <CalendarHeatmap {...example} thresholds={byRank ? example.thresholds : undefined} />
      </Column>
    </Theme>
  );
}

/** The same edits in even color steps, mostly pale, and in steps by rank. */
export default function ColorByRankMotion() {
  return (
    <MotionStage label="the heatmap between even steps and steps by rank">
      <Toggling />
    </MotionStage>
  );
}
