import { useEffect, useRef, useState } from 'react';
import { Button, Column, Text, TextField } from '@envsemble/envui';

export default function PendingButton() {
  const [name, setName] = useState('Website refresh');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        setSaved('');
        // The project saves to a server; a timer stands in for it here.
        timer.current = window.setTimeout(() => {
          setSaving(false);
          setSaved(`Saved “${name}”.`);
        }, 1500);
      }}
    >
      <Column gap={4} align="start">
        <TextField variant="floating" label="Project name" value={name} onValueChange={setName} />
        {/* The button that started the work shows it; the rest of the form stays as it is. */}
        <Button type="submit" pending={saving}>
          Save changes
        </Button>
        <Text role="status" emphasis="muted">
          {saved}
        </Text>
      </Column>
    </form>
  );
}
