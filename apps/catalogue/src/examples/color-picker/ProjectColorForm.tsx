import { useState, type FormEvent } from 'react';
import { ActionGroup, Button, ColorPicker, Stack, Text } from '@envsemble/envui';

export default function ProjectColorForm() {
  const [applied, setApplied] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplied(String(new FormData(event.currentTarget).get('color')));
  };
  return (
    <form
      onSubmit={submit}
      onReset={() => setApplied('')}
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      <Stack>
        <ColorPicker
          label="Project color"
          name="color"
          defaultValue="#6b4fa3"
          hint="Shown beside the project in lists."
        />
        <ActionGroup>
          <Button type="submit">Apply color</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </ActionGroup>
        <Text variant="caption" tone="muted" role="status">
          {applied && `Applied ${applied}.`}
        </Text>
      </Stack>
    </form>
  );
}
