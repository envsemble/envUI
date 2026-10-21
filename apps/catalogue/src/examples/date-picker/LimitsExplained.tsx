import { DatePicker } from '@envsemble/envui';

export default function LimitsExplained() {
  return (
    <DatePicker
      label="Review by"
      description="Any day this quarter."
      placeholder="Choose a day"
      min="2026-10-01"
      max="2026-12-31"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
