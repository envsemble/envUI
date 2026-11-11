import { useState } from 'react';
import {
  Button,
  Dialog,
  CalendarHeatmap,
  EnvUIProvider,
  Theme,
  type CalendarHeatmapDay,
  type ColorScheme,
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

export default function CalendarHeatmapFixture({ theme }: { theme: ColorScheme }) {
  const [data, setData] = useState(year);
  return (
    // British English, so the names of days read as Sat 10 Oct 2026, from Intl, with a comma after
    // the weekday in some engines.
    <EnvUIProvider locale="en-GB">
      <Theme theme={theme} data-testid={`calendar-heatmap-${theme}`} className="fixture-section">
        <CalendarHeatmap
          weekStart={0}
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
        <Dialog
          title={`Activity details ${theme}`}
          trigger={<Button>Open activity {theme}</Button>}
        >
          <CalendarHeatmap
            weekStart={0}
            aria-label={`Activity in a dialog ${theme}`}
            data={year.slice(-60)}
            startDate="2026-08-12"
            endDate="2026-10-10"
          />
        </Dialog>
      </Theme>
    </EnvUIProvider>
  );
}
