import { DatePicker } from '@envsemble/envui';

export default function NamedMoment() {
  return (
    <DatePicker
      label="Publish on"
      defaultValue="2026-10-20"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
