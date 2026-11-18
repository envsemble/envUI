import { TimePicker } from '@envsemble/envui';

export default function TimePickerPopupAnatomy() {
  return (
    <TimePicker
      label="Starts at"
      defaultValue="09:30"
      defaultOpen
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
