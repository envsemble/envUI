import { TimePicker } from '@envsemble/envui';

export default function TimePickerAnatomy() {
  return (
    <TimePicker
      label="Starts at"
      description="When the workshop begins."
      defaultValue="09:30"
      clearable
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
