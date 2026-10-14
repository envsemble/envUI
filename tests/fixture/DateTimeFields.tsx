import { useState } from 'react';
import {
  Button,
  Calendar,
  DateTimeField,
  Dialog,
  Surface,
  Theme,
  type ThemeValue,
} from '@envsemble/envui';

export function DateTimeFieldFixture({ theme }: { theme: ThemeValue }) {
  const [submitted, setSubmitted] = useState('');
  const [due, setDue] = useState<string | null>('2026-10-20');
  const [changes, setChanges] = useState<(string | null)[]>([]);
  const [day, setDay] = useState<string | null>('2026-10-14');
  const [launch, setLaunch] = useState<string | null>('1969-12-20T09:30');
  return (
    <Theme theme={theme} data-testid={`date-time-${theme}`} className="fixture-section">
      <form
        data-testid={`date-time-form-${theme}`}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(
            JSON.stringify({
              publish: data.get('publish'),
              meeting: data.get('meeting'),
              review: data.get('review'),
            }),
          );
        }}
      >
        <DateTimeField
          label={`Publish on ${theme}`}
          name="publish"
          defaultValue="2026-10-20"
          locale="en-GB"
          hint="The day the report goes out."
          clearable
        />
        <DateTimeField
          label={`Meeting ${theme}`}
          name="meeting"
          withTime
          defaultValue="2026-10-21T09:30"
          locale="en-GB"
          defaultTime="09:00"
          clearable
        />
        <DateTimeField
          label={`Review by ${theme}`}
          name="review"
          locale="en-GB"
          required
          placeholder="Choose a day"
          min="2026-10-10"
          max="2026-11-15"
        />
        <div className="fixture-actions">
          <Button type="submit">Submit dates {theme}</Button>
          <Button type="reset" variant="secondary">
            Reset dates {theme}
          </Button>
        </div>
      </form>
      <output data-testid={`date-time-submitted-${theme}`}>{submitted}</output>
      <DateTimeField
        label={`Due ${theme}`}
        locale="en-US"
        weekStart={0}
        value={due}
        onValueChange={(next) => {
          setDue(next);
          setChanges((current) => [...current, next]);
        }}
        clearable
      />
      <output data-testid={`date-time-due-${theme}`}>{JSON.stringify({ due, changes })}</output>
      <Surface
        padding={2}
        density="compact"
        className="fixture-actions"
        data-testid={`date-time-compact-${theme}`}
      >
        <DateTimeField
          density="compact"
          aria-label={`Compact start ${theme}`}
          placeholder="Start"
          locale="en-GB"
          withTime
          min="2026-10-14T08:00"
          max="2026-10-31T18:00"
        />
        <Button variant="secondary">Compact neighbour {theme}</Button>
      </Surface>
      <div className="fixture-actions">
        <DateTimeField
          label={`Disabled date ${theme}`}
          locale="en-GB"
          defaultValue="2026-10-20"
          disabled
        />
        <DateTimeField
          label={`Read only date ${theme}`}
          locale="en-GB"
          defaultValue="2026-10-20"
          readOnly
        />
        <DateTimeField label={`Invalid date ${theme}`} locale="en-GB" error="Choose a later day." />
      </div>
      <div className="fixture-actions">
        {/* Days before 1970 count back from it. */}
        <DateTimeField
          label={`Launch ${theme}`}
          locale="en-GB"
          withTime
          value={launch}
          onValueChange={setLaunch}
        />
        <output data-testid={`date-time-launch-${theme}`}>{launch}</output>
        {/* Named by the application's own text instead of a label. */}
        <span id={`date-time-starts-${theme}`}>Starts on {theme}</span>
        <DateTimeField aria-labelledby={`date-time-starts-${theme}`} locale="en-GB" />
        {/* Without a label, a standard field shows its placeholder. */}
        <DateTimeField aria-label={`Ends ${theme}`} placeholder="Pick an end" locale="en-GB" />
      </div>
      <div dir="rtl" className="fixture-actions">
        <DateTimeField label={`Arabic date ${theme}`} locale="ar-EG" defaultValue="2026-10-14" />
      </div>
      <div className="fixture-actions">
        <Calendar
          aria-label={`Planner ${theme}`}
          data-testid={`calendar-${theme}`}
          locale="en-GB"
          value={day}
          onValueChange={setDay}
          min="2026-09-01"
          max="2027-03-31"
        />
        <output data-testid={`calendar-value-${theme}`}>{day}</output>
        <div dir="rtl">
          <Calendar
            data-testid={`calendar-rtl-${theme}`}
            locale="ar-EG"
            defaultValue="2026-10-14"
          />
        </div>
        {/* Persian uses its own calendar by default; the grid's days are Gregorian. */}
        <Calendar
          aria-label={`Persian planner ${theme}`}
          data-testid={`calendar-persian-${theme}`}
          locale="fa-IR"
          defaultValue="2026-10-14"
        />
      </div>
      <Dialog
        title={`Schedule ${theme}`}
        trigger={<Button variant="secondary">Schedule {theme}</Button>}
      >
        <DateTimeField
          label={`Remind me ${theme}`}
          locale="en-GB"
          withTime
          clearable
          defaultValue="2026-10-22T14:00"
        />
      </Dialog>
    </Theme>
  );
}
