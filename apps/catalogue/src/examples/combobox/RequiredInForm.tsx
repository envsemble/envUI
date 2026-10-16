import { useState, type FormEvent } from 'react';
import { ActionGroup, Button, Combobox, Stack, Text, type ComboboxItem } from '@envsemble/envui';

const topics: ComboboxItem[] = [
  'Accessibility',
  'Documentation',
  'Localization',
  'Performance',
  'Security',
  'Testing',
].map((label) => ({ value: label.toLowerCase(), label }));

export default function RequiredInForm() {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // A multiple combobox submits one entry for each chosen value.
    const chosen = new FormData(event.currentTarget).getAll('topics');
    setError(chosen.length ? undefined : 'Choose at least one topic.');
    setSent(chosen.length ? `Filed under ${chosen.join(', ')}.` : '');
  };
  return (
    <form
      onSubmit={submit}
      onReset={() => {
        setError(undefined);
        setSent('');
      }}
      noValidate
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      <Stack>
        <Combobox
          multiple
          name="topics"
          label="Topics"
          placeholder="Add topics"
          items={topics}
          defaultValue={['accessibility']}
          required
          error={error}
          clearable
        />
        <ActionGroup>
          <Button type="submit">File request</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </ActionGroup>
        <Text variant="caption" tone="muted" role="status">
          {sent}
        </Text>
      </Stack>
    </form>
  );
}
