import { DatePicker } from '@envsemble/envui';

export default function DatePickerAnatomy() {
  return (
    <DatePicker
      label="Publish on"
      description="The day the report goes out."
      defaultValue="2026-10-20"
      clearable
      style={{ inlineSize: 'min(100%, 22rem)' }}
    />
  );
}
