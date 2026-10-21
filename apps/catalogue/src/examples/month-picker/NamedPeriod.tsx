import { MonthPicker } from '@envsemble/envui';

export default function NamedPeriod() {
  return (
    <MonthPicker
      label="Report month"
      defaultValue="2026-10"
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
