import { Textarea } from '@envsemble/envui';

export default function Notes() {
  return (
    <Textarea
      label="Notes"
      name="notes"
      rows={3}
      defaultValue="Agree the launch date with the design team."
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
