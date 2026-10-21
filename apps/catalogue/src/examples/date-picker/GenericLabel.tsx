import { DatePicker } from '@envsemble/envui';

export default function GenericLabel() {
  return (
    <DatePicker label="Date" defaultValue="2026-10-20" style={{ inlineSize: 'min(100%, 18rem)' }} />
  );
}
