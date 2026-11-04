import { TimePicker } from '@envsemble/envui';

export default function TimePickerPopupAnatomy() {
  // Shown open in the docs; without defaultOpen, the times open from the field.
  return (
    <TimePicker
      label="Starts at"
      defaultValue="09:30"
      defaultOpen
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
