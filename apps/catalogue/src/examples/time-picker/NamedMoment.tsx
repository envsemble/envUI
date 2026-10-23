import { TimePicker } from '@envsemble/envui';

export default function NamedMoment() {
  return (
    <TimePicker label="Reminder" defaultValue="08:30" style={{ inlineSize: 'min(100%, 16rem)' }} />
  );
}
