import { DatePicker } from '@envsemble/envui';

export default function LimitsUnexplained() {
  return (
    <DatePicker
      label="Review by"
      placeholder="Choose a day"
      min="2026-10-01"
      max="2026-12-31"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
