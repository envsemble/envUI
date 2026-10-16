import { useMemo } from 'react';
import { CalendarHeatmap, Kbd, type CalendarHeatmapDay } from '@envsemble/envui';
import { Example } from './Example';
import { Preview } from './Preview';

/** A repeatable year of activity ending today: busier midweek, with quiet stretches. */
function activityYear(days: number, seed: number): CalendarHeatmapDay[] {
  const today = new Date();
  const end = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Array.from({ length: days }, (_, index) => {
    const time = end - (days - 1 - index) * 86_400_000;
    const weekday = new Date(time).getUTCDay();
    const wave = Math.sin((index + seed) / 9) + Math.sin((index * 5 + seed) / 23) + 0.6;
    const weekend = weekday === 0 || weekday === 6 ? 0.3 : 1;
    return {
      date: new Date(time).toISOString().slice(0, 10),
      value: Math.max(0, Math.round(wave * 3 * weekend)),
    };
  });
}

export function CalendarHeatmapPreview() {
  const activity = useMemo(() => activityYear(371, 4), []);
  const deployments = useMemo(
    () =>
      activityYear(140, 11).map((day) => ({
        ...day,
        label: `${day.value} ${day.value === 1 ? 'deployment' : 'deployments'}`,
      })),
    [],
  );
  return (
    <Preview>
      <Example
        title="A year of activity"
        size="wide"
        caption={
          <>
            Hover or focus a day for its value. The grid is one tab stop: <Kbd>↑</Kbd> and{' '}
            <Kbd>↓</Kbd> move by day, <Kbd>←</Kbd> and <Kbd>→</Kbd> by week. Narrow windows scroll
            the weeks, starting at the most recent.
          </>
        }
      >
        <CalendarHeatmap aria-label="Activity in the last year" data={activity} />
      </Example>
      <Example
        title="A tone and weeks from Monday"
        caption="Each step mixes the tone into the canvas; labels can name the unit of each day."
      >
        <CalendarHeatmap
          aria-label="Deployments in the last twenty weeks"
          data={deployments}
          tone="success"
          weekStart={1}
          levels={4}
        />
      </Example>
    </Preview>
  );
}
