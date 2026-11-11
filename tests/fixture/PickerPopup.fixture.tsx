import { DatePicker, MonthPicker, TimePicker } from '@envsemble/envui';

export const mount = 'standalone';

/** One of each picker, each with a value and a clear button, so every card shows both actions. */
export default function PickerPopupFixture() {
  return (
    <div className="fixture-section">
      <DatePicker label="Card date" defaultValue="2026-10-20" locale="en-GB" clearable />
      <TimePicker label="Card time" defaultValue="09:30" locale="en-GB" clearable />
      <MonthPicker label="Card month" defaultValue="2026-10" locale="en-GB" clearable />
    </div>
  );
}
