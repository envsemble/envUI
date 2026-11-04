import { DatePicker } from '@envsemble/envui';

export default function NeedlessTime() {
  return (
    <DatePicker
      label="Due"
      granularity="minute"
      defaultValue="2026-10-30T00:00"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
