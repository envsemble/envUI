import { DatePicker } from '@envsemble/envui';

export default function DayOnly() {
  return (
    <DatePicker label="Due" defaultValue="2026-10-30" style={{ inlineSize: 'min(100%, 18rem)' }} />
  );
}
