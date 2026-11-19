import { useState } from 'react';
import { Button, Column, DatePicker, Row, Text } from '@envsemble/envui';

const presets = [
  { label: 'Tomorrow', day: '2026-03-04' },
  { label: 'Next Monday', day: '2026-03-09' },
  { label: 'In two weeks', day: '2026-03-17' },
];
const meetingDays = new Set(['2026-03-05', '2026-03-11', '2026-03-12', '2026-03-19']);
const isWeekend = (day: string) => [0, 6].includes(new Date(`${day}T00:00Z`).getUTCDay());

export default function PresetsAndBusyDays() {
  const [due, setDue] = useState<string | null>('2026-03-09');
  const [open, setOpen] = useState(true);
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <DatePicker
        label="Due date"
        value={due}
        onValueChange={setDue}
        open={open}
        onOpenChange={setOpen}
        isDateUnavailable={isWeekend}
        renderDay={(day, { number }) => (
          <Column align="center" gap={0}>
            {number}
            <Text
              variant="caption"
              aria-hidden="true"
              style={{ lineHeight: 0.5, visibility: meetingDays.has(day) ? 'visible' : 'hidden' }}
            >
              •
            </Text>
          </Column>
        )}
        popupHeader={
          <Row wrap gap={1}>
            {presets.map((preset) => (
              <Button
                key={preset.day}
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDue(preset.day);
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </Row>
        }
        popupFooter={
          <Text variant="caption" emphasis="muted">
            Weekends are closed
          </Text>
        }
      />
    </div>
  );
}
