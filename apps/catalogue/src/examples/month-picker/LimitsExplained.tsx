import { MonthPicker } from '@envsemble/envui';

export default function LimitsExplained() {
  return (
    <MonthPicker
      label="Budget month"
      description="Any month of the fiscal year, April to March."
      min="2026-04"
      max="2027-03"
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
