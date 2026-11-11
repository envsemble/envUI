import { TimePicker } from '@envsemble/envui';

export default function OfficeHours() {
  return (
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <TimePicker
        label="Call back at"
        description="Any half hour between 08:00 and 18:00."
        placeholder="Choose a time"
        // On the 24-hour clock, as the description writes the times.
        locale="en-GB"
        min="08:00"
        max="18:00"
        minuteStep={30}
      />
    </div>
  );
}
