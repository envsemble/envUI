import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Column, Row, Text, Tooltip } from '@envsemble/envui';

const dayMs = 86_400_000;
const firstMonday = Date.UTC(2026, 0, 5);
const weeks = 12;
const weekdays = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const thresholds = [1, 3, 5, 7];
const dates = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const months = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });

const days = Array.from({ length: weeks * 7 }, (_, index) => {
  const time = firstMonday + index * dayMs;
  const weekend = index % 7 >= 5;
  const count = Math.max(0, Math.round((Math.sin(index / 4) + 1.2) * 2.4 * (weekend ? 0.3 : 1)));
  return {
    index,
    count,
    level: thresholds.filter((threshold) => count >= threshold).length,
    name: `${dates.format(time)}: ${count} ${count === 1 ? 'deployment' : 'deployments'}`,
  };
});

function fill(level: number) {
  if (level === 0) return 'var(--env-color-bg-neutral-muted)';
  const share = 40 + ((level - 1) * 60) / (thresholds.length - 1);
  return `color-mix(in srgb, var(--env-color-fg-success) ${share}%, var(--env-color-bg-page))`;
}

const gap = '0.1875rem';

const cell = {
  flex: 'none',
  inlineSize: '0.75rem',
  blockSize: '0.75rem',
  borderRadius: 'calc(var(--env-space-1) / 2)',
  forcedColorAdjust: 'none',
} as const;

const weekdayColumn = { flex: 'none', inlineSize: '2rem' } as const;

export default function DailyActivity() {
  const headingId = useId();
  const grid = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(days.length - 1);

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const forward = getComputedStyle(event.currentTarget).direction === 'rtl' ? -7 : 7;
    const steps: Record<string, number> = {
      ArrowUp: active - 1,
      ArrowDown: active + 1,
      ArrowLeft: active - forward,
      ArrowRight: active + forward,
      Home: 0,
      End: days.length - 1,
    };
    const next = steps[event.key];
    if (next === undefined) return;
    event.preventDefault();
    if (next < 0 || next >= days.length) return;
    grid.current?.querySelector<HTMLElement>(`[data-day="${next}"]`)?.focus();
  }

  return (
    <Column gap={2} align="start">
      <Text render={<h3 />} variant="title" id={headingId}>
        Deployments
      </Text>
      <Column
        gap={0}
        style={{
          gap,
          color: 'var(--env-color-fg-muted)',
          font: 'var(--env-font-weight-regular) 0.75rem / 1 var(--env-font-family)',
        }}
      >
        <Row aria-hidden="true" gap={0} style={{ gap, paddingBlockEnd: 'var(--env-space-1)' }}>
          <span style={weekdayColumn} />
          {Array.from({ length: weeks }, (_, week) => {
            const monday = firstMonday + week * 7 * dayMs;
            return (
              <span key={week} style={{ ...cell, whiteSpace: 'nowrap' }}>
                {new Date(monday).getUTCDate() <= 7 ? months.format(monday) : ''}
              </span>
            );
          })}
        </Row>
        <Column
          ref={grid}
          role="grid"
          aria-labelledby={headingId}
          aria-readonly="true"
          onKeyDown={move}
          gap={0}
          style={{ gap }}
        >
          {weekdays.map((weekday, row) => (
            <Row key={row} role="row" align="center" gap={0} style={{ gap }}>
              <span aria-hidden="true" style={weekdayColumn}>
                {weekday}
              </span>
              {Array.from({ length: weeks }, (_, week) => {
                const day = days[week * 7 + row]!;
                return (
                  <Tooltip key={week} content={day.name} hoverDetail={false}>
                    <span
                      role="gridcell"
                      aria-label={day.name}
                      tabIndex={day.index === active ? 0 : -1}
                      data-day={day.index}
                      onFocus={() => setActive(day.index)}
                      style={{ ...cell, background: fill(day.level) }}
                    />
                  </Tooltip>
                );
              })}
            </Row>
          ))}
        </Column>
      </Column>
      <Row aria-hidden="true" align="center" gap={1}>
        <Text render={<span />} variant="caption">
          Less
        </Text>
        {[0, ...thresholds.map((_, index) => index + 1)].map((level) => (
          <span key={level} style={{ ...cell, background: fill(level) }} />
        ))}
        <Text render={<span />} variant="caption">
          More
        </Text>
      </Row>
    </Column>
  );
}
