import { useState } from 'react';
import { Button, MonthPicker } from '@envsemble/envui';

export const mount = 'standalone';

export default function MonthPickerFixture() {
  const [submitted, setSubmitted] = useState('');
  const [billing, setBilling] = useState<string | null>('2026-03');
  const [changes, setChanges] = useState<(string | null)[]>([]);
  return (
    <div className="fixture-section">
      <form
        data-testid="month-picker-form"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(
            JSON.stringify({
              report: data.get('report'),
              budget: data.get('budget'),
              closed: data.get('closed'),
            }),
          );
        }}
      >
        <MonthPicker
          label="Report month"
          name="report"
          defaultValue="2026-10"
          locale="en-GB"
          description="The month the report covers."
          clearable
        />
        <MonthPicker
          label="Budget month"
          name="budget"
          locale="en-GB"
          required
          placeholder="Choose a month"
          min="2026-04"
          max="2027-03"
        />
        {/* Read-only, so its emptiness never keeps the form from submitting. */}
        <MonthPicker label="Closed" name="closed" locale="en-GB" readOnly required />
        <div className="fixture-actions">
          <Button type="submit">Submit months</Button>
          <Button type="reset" variant="secondary">
            Reset months
          </Button>
        </div>
      </form>
      <output data-testid="month-picker-submitted">{submitted}</output>
      <MonthPicker
        label="Billing"
        locale="en-US"
        value={billing}
        onValueChange={(next) => {
          setBilling(next);
          setChanges((current) => [...current, next]);
        }}
        clearable
      />
      <output data-testid="month-picker-billing">{JSON.stringify({ billing, changes })}</output>
      <div className="fixture-actions">
        <MonthPicker
          label="Short month"
          locale="en-GB"
          defaultValue="2026-10"
          formatOptions={{ month: 'short', year: '2-digit' }}
        />
        <MonthPicker label="Monat" locale="de-DE" defaultValue="2026-05" />
        <MonthPicker label="Disabled month" locale="en-GB" defaultValue="2026-10" disabled />
        <MonthPicker label="Read only month" locale="en-GB" defaultValue="2026-10" readOnly />
        <MonthPicker label="Invalid month" locale="en-GB" error="Choose a later month." />
      </div>
      <div dir="rtl" className="fixture-actions">
        <MonthPicker label="Arabic month" locale="ar-EG" defaultValue="2026-10" />
      </div>
    </div>
  );
}
