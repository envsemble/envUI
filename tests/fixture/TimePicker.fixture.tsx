import { useState } from 'react';
import { Button, TimePicker } from '@envsemble/envui';

export const mount = 'standalone';

/**
 * Time pickers in a form, one controlled on a 12-hour clock and one read-only. Their clocks in other
 * locales, and their states, are tests/library/source/TimePicker.test.mjs's.
 */
export default function TimePickerFixture() {
  const [submitted, setSubmitted] = useState('');
  const [reminder, setReminder] = useState<string | null>('14:00');
  const [changes, setChanges] = useState<(string | null)[]>([]);
  return (
    <div className="fixture-section">
      <form
        data-testid="time-picker-form"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(
            JSON.stringify({
              start: data.get('start'),
              alarm: data.get('alarm'),
              locked: data.get('locked'),
            }),
          );
        }}
      >
        <TimePicker
          label="Start time"
          name="start"
          defaultValue="09:30"
          locale="en-GB"
          description="When the shift begins."
          clearable
        />
        <TimePicker
          label="Alarm"
          name="alarm"
          locale="en-US"
          required
          placeholder="Choose a time"
          min="08:00"
          max="18:00"
          minuteStep={30}
        />
        {/* Read-only, so its emptiness never keeps the form from submitting. */}
        <TimePicker label="Locked" name="locked" locale="en-GB" readOnly required />
        <div className="fixture-actions">
          <Button type="submit">Submit times</Button>
          <Button type="reset" variant="secondary">
            Reset times
          </Button>
        </div>
      </form>
      <output data-testid="time-picker-submitted">{submitted}</output>
      <TimePicker
        label="Reminder"
        locale="en-US"
        value={reminder}
        onValueChange={(next) => {
          setReminder(next);
          setChanges((current) => [...current, next]);
        }}
        clearable
      />
      <output data-testid="time-picker-reminder">{JSON.stringify({ reminder, changes })}</output>
      <TimePicker label="Read only time" locale="en-GB" defaultValue="12:00" readOnly />
    </div>
  );
}
