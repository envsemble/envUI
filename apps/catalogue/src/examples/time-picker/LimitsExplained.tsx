import { TimePicker } from '@envsemble/envui';

export default function LimitsExplained() {
  return (
    <TimePicker
      label="Call back at"
      description="Any half hour from 08:00 to 18:00."
      min="08:00"
      max="18:00"
      minuteStep={30}
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
