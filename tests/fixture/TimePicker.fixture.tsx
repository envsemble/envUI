import { useState } from 'react';
import { Button, DatePicker, TimePicker } from '@envsemble/envui';

export function TimePickersFixture() {
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
      <div className="fixture-actions">
        {/* A value between the steps keeps its own row. */}
        <TimePicker label="Check in" locale="en-GB" defaultValue="10:07" minuteStep={5} />
        <TimePicker label="Abfahrt" locale="de-DE" defaultValue="18:45" />
        {/* Korean writes the day period before the hour. */}
        <TimePicker label="Korean time" locale="ko-KR" defaultValue="14:30" />
        {/* hourCycle sets the clock whatever the locale's. */}
        <TimePicker label="Rota" locale="en-US" hourCycle="h23" defaultValue="18:45" />
        <TimePicker label="Twelve-hour" locale="en-GB" hourCycle="h12" defaultValue="18:45" />
        <TimePicker label="Disabled time" locale="en-GB" defaultValue="12:00" disabled />
        <TimePicker label="Read only time" locale="en-GB" defaultValue="12:00" readOnly />
        <TimePicker label="Invalid time" locale="en-GB" error="Choose a later time." />
      </div>
      <div className="fixture-actions">
        {/* A time with a date, in a column beside the calendar. */}
        <DatePicker
          label="Departure"
          granularity="minute"
          locale="en-US"
          minuteStep={30}
          defaultValue="2026-10-21T09:10"
        />
        <DatePicker
          label="Shift start"
          granularity="minute"
          locale="en-US"
          hourCycle="h23"
          defaultValue="2026-10-21T18:00"
        />
      </div>
    </div>
  );
}
