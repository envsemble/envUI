import { TimePicker } from '@envsemble/envui';

export default function GenericLabel() {
  return (
    <TimePicker label="Time" defaultValue="08:30" style={{ inlineSize: 'min(100%, 16rem)' }} />
  );
}
