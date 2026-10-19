import { DatePicker } from '@envsemble/envui';

export default function WithinRange() {
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <DatePicker
        label="Review by"
        description="Any day this quarter."
        placeholder="Choose a day"
        min="2026-10-01"
        max="2026-12-31"
      />
    </div>
  );
}
