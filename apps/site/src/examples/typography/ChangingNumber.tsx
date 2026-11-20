import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Checkbox, Column } from '@envsemble/envui';

const statuses = [
  { value: 'open', label: 'Open', count: 24 },
  { value: 'review', label: 'In review', count: 9 },
  { value: 'done', label: 'Done', count: 95 },
];

const milliseconds = (time: string) =>
  time.trim().endsWith('ms') ? Number.parseFloat(time) : Number.parseFloat(time) * 1000;

function RollingNumber({ value }: { value: number }) {
  const shown = useRef<HTMLSpanElement>(null);
  const last = useRef(value);
  useLayoutEffect(() => {
    const from = last.current;
    last.current = value;
    const element = shown.current;
    if (!element || from === value) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const style = getComputedStyle(element);
    const start = value > from ? '0.6em' : '-0.6em';
    element.animate(
      { opacity: [0, 1], transform: [`translateY(${start})`, 'none'] },
      {
        duration: milliseconds(style.getPropertyValue('--env-motion-duration-medium')),
        easing: style.getPropertyValue('--env-motion-ease-enter').trim(),
      },
    );
  }, [value]);
  return (
    <span
      style={{
        display: 'inline-flex',
        overflow: 'clip',
        verticalAlign: 'bottom',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span ref={shown} style={{ display: 'inline-block' }}>
        {value.toLocaleString('en')}
      </span>
    </span>
  );
}

export default function ChangingNumber() {
  const [chosen, setChosen] = useState(['open', 'review']);
  const total = statuses
    .filter(({ value }) => chosen.includes(value))
    .reduce((sum, { count }) => sum + count, 0);
  return (
    <Column gap={4} align="start">
      <Column gap={2} role="group" aria-label="Status">
        {statuses.map(({ value, label }) => (
          <Checkbox
            key={value}
            label={label}
            checked={chosen.includes(value)}
            onCheckedChange={(checked) =>
              setChosen((current) =>
                checked ? [...current, value] : current.filter((item) => item !== value),
              )
            }
          />
        ))}
      </Column>
      <Button disabled={total === 0}>
        Show <RollingNumber value={total} /> {total === 1 ? 'task' : 'tasks'}
      </Button>
    </Column>
  );
}
