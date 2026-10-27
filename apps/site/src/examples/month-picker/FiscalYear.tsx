import { MonthPicker } from '@envsemble/envui';

export default function FiscalYear() {
  return (
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <MonthPicker
        label="Budget month"
        variant="floating"
        description="Any month of the fiscal year, April to March."
        placeholder="Choose a month"
        min="2026-04"
        max="2027-03"
      />
    </div>
  );
}
