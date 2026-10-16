import { useState } from 'react';
import {
  Button,
  Dialog,
  CalendarHeatmap,
  Surface,
  Theme,
  type CalendarHeatmapDay,
  type ThemeValue,
} from '@envsemble/envui';

/** A deterministic year of activity, so the fixture renders the same days everywhere. */
function activity(end: string, days: number, seed: number): CalendarHeatmapDay[] {
  const last = Date.parse(`${end}T00:00:00Z`);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(last - (days - 1 - index) * 86_400_000).toISOString().slice(0, 10);
    const wave = Math.sin((index + seed) / 6) + Math.sin((index * 7 + seed) / 17);
    return { date, value: Math.max(0, Math.round(wave * 4)) };
  });
}

const year = activity('2026-10-10', 365, 3);

export function CalendarHeatmapFixture({ theme }: { theme: ThemeValue }) {
  const [data, setData] = useState(year);
  return (
    <Theme theme={theme} data-testid={`calendar-heatmap-${theme}`} className="fixture-section">
      <CalendarHeatmap
        aria-label={`Activity ${theme}`}
        data={data}
        data-testid={`calendar-heatmap-year-${theme}`}
      />
      <Button
        variant="secondary"
        onClick={() =>
          setData((days) =>
            days.map((day) => (day.date === '2026-10-10' ? { ...day, value: 20 } : day)),
          )
        }
      >
        Update {theme}
      </Button>
      <Surface
        background="default"
        padding={4}
        data-surface="pane"
        className="fixture-heatmap-narrow"
      >
        <CalendarHeatmap
          aria-label={`Deployments ${theme}`}
          data={[
            { date: '2026-03-02', value: 1 },
            { date: '2026-03-03', value: 4, label: '4 deployments' },
            { date: '2026-03-10', value: 2 },
            { date: '2026-03-24', value: 8 },
          ]}
          startDate="2026-03-01"
          endDate="2026-04-04"
          weekStart={1}
          levels={3}
          maxValue={8}
          tone="success"
          formatTooltip={(day) => `${day.label ?? `${day.value} deployments`} on ${day.date}`}
          monthLabels={[
            'Jan',
            'Feb',
            'Mär',
            'Apr',
            'Mai',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Okt',
            'Nov',
            'Dez',
          ]}
          weekdayLabels={['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']}
          lessLabel="Weniger"
          moreLabel="Mehr"
        />
      </Surface>
      <Dialog title={`Activity details ${theme}`} trigger={<Button>Open activity {theme}</Button>}>
        <CalendarHeatmap
          aria-label={`Activity in a dialog ${theme}`}
          data={year.slice(-60)}
          startDate="2026-08-12"
          endDate="2026-10-10"
        />
      </Dialog>
      <CalendarHeatmap
        aria-label={`Ranked ${theme}`}
        data={[
          { date: '2026-05-04', value: 5 },
          { date: '2026-05-05', value: 15 },
          { date: '2026-05-06', value: 25 },
          { date: '2026-05-07', value: 45 },
          { date: '2026-05-08', value: 0.5 },
        ]}
        startDate="2026-05-03"
        endDate="2026-05-16"
        thresholds={[40, 1, 20, 10]}
      />
      <CalendarHeatmap
        aria-label={`From zero ${theme}`}
        data={[
          { date: '2026-05-04', value: 0 },
          { date: '2026-05-05', value: 10 },
          { date: '2026-05-06', value: -2 },
        ]}
        startDate="2026-05-03"
        endDate="2026-05-09"
        thresholds={[0, 10]}
      />
      <CalendarHeatmap
        aria-label={`Two steps ${theme}`}
        data={[
          { date: '2026-05-04', value: 3 },
          { date: '2026-05-05', value: 0 },
        ]}
        startDate="2026-05-03"
        endDate="2026-05-09"
        levels={2}
      />
    </Theme>
  );
}
