import { TimePicker } from '@envsemble/envui';

export default function LimitsUnexplained() {
  return (
    <TimePicker
      label="Call back at"
      min="08:00"
      max="18:00"
      minuteStep={30}
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
