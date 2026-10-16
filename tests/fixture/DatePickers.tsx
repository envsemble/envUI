import { useState } from 'react';
import {
  Button,
  Calendar,
  DatePicker,
  Dialog,
  Surface,
  Theme,
  type ThemeValue,
} from '@envsemble/envui';

export function DatePickerFixture({ theme }: { theme: ThemeValue }) {
  const [submitted, setSubmitted] = useState('');
  const [due, setDue] = useState<string | null>('2026-10-20');
  const [changes, setChanges] = useState<(string | null)[]>([]);
  const [day, setDay] = useState<string | null>('2026-10-14');
  const [launch, setLaunch] = useState<string | null>('1969-12-20T09:30');
  return (
    <Theme theme={theme} data-testid={`date-picker-${theme}`} className="fixture-section">
      <form
        data-testid={`date-picker-form-${theme}`}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(
            JSON.stringify({
              publish: data.get('publish'),
              meeting: data.get('meeting'),
              review: data.get('review'),
              approved: data.get('approved'),
            }),
          );
        }}
      >
        <DatePicker
          label={`Publish on ${theme}`}
          name="publish"
          defaultValue="2026-10-20"
          locale="en-GB"
          hint="The day the report goes out."
          clearable
        />
        <DatePicker
          label={`Meeting ${theme}`}
          name="meeting"
          withTime
          defaultValue="2026-10-21T09:30"
          locale="en-GB"
          defaultTime="09:00"
          clearable
        />
        <DatePicker
          label={`Review by ${theme}`}
          name="review"
          locale="en-GB"
          required
          placeholder="Choose a day"
          min="2026-10-10"
          max="2026-11-15"
        />
        {/* Read-only, so its emptiness never keeps the form from submitting. */}
        <DatePicker
          label={`Approved on ${theme}`}
          name="approved"
          locale="en-GB"
          readOnly
          required
        />
        <div className="fixture-actions">
          <Button type="submit">Submit dates {theme}</Button>
          <Button type="reset" variant="secondary">
            Reset dates {theme}
          </Button>
        </div>
      </form>
      <output data-testid={`date-picker-submitted-${theme}`}>{submitted}</output>
      <DatePicker
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
      <output data-testid={`date-picker-due-${theme}`}>{JSON.stringify({ due, changes })}</output>
      <Surface padding={2} className="fixture-actions" data-testid={`date-picker-compact-${theme}`}>
        <DatePicker
          size="sm"
          showLabel={false}
          aria-label={`Compact start ${theme}`}
          placeholder="Start"
          locale="en-GB"
          withTime
          min="2026-10-14T08:00"
          max="2026-10-31T18:00"
        />
        <Button variant="secondary" size="sm">
          Compact neighbour {theme}
        </Button>
      </Surface>
      <div className="fixture-actions">
        <DatePicker
          label={`Disabled date ${theme}`}
          locale="en-GB"
          defaultValue="2026-10-20"
          disabled
        />
        <DatePicker
          label={`Read only date ${theme}`}
          locale="en-GB"
          defaultValue="2026-10-20"
          readOnly
        />
        <DatePicker label={`Invalid date ${theme}`} locale="en-GB" error="Choose a later day." />
      </div>
      <div className="fixture-actions">
        {/* Days before 1970 count back from it. */}
        <DatePicker
          label={`Launch ${theme}`}
          locale="en-GB"
          withTime
          value={launch}
          onValueChange={setLaunch}
        />
        <output data-testid={`date-picker-launch-${theme}`}>{launch}</output>
        {/* Named by the application's own text instead of a label. */}
        <span id={`date-picker-starts-${theme}`}>Starts on {theme}</span>
        <DatePicker aria-labelledby={`date-picker-starts-${theme}`} locale="en-GB" />
        {/* Without a label, a standard field shows its placeholder. */}
        <DatePicker aria-label={`Ends ${theme}`} placeholder="Pick an end" locale="en-GB" />
      </div>
      <div dir="rtl" className="fixture-actions">
        <DatePicker label={`Arabic date ${theme}`} locale="ar-EG" defaultValue="2026-10-14" />
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
        <DatePicker
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
