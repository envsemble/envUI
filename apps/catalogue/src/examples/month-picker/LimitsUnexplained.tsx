import { MonthPicker } from '@envsemble/envui';

export default function LimitsUnexplained() {
  return (
    <MonthPicker
      label="Budget month"
      min="2026-04"
      max="2027-03"
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
