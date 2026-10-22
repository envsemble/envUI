import { DatePicker } from '@envsemble/envui';

export default function DatePickerPopupAnatomy() {
  // Shown open in the docs; without defaultOpen, the calendar opens from the field.
  return (
    <DatePicker
      label="Publish on"
      defaultValue="2026-10-20"
      defaultOpen
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
