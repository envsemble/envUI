import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Radio, RadioGroup, Stack, Text } from '@envsemble/envui';

export default function GroupedChoices() {
  const [saved, setSaved] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // A checked box submits its value under the group's name; an unchecked one submits nothing.
    const topics = data.getAll('topics').length;
    setSaved(
      topics === 0
        ? 'Preferences saved. You won’t get notifications.'
        : topics === 1
          ? 'Preferences saved. You’ll get notifications about 1 topic.'
          : `Preferences saved. You’ll get notifications about ${topics} topics.`,
    );
  };
  return (
    <form noValidate onSubmit={submit}>
      <Stack gap={6}>
        {/* One choice of several: RadioGroup is a fieldset whose legend names the options. */}
        <RadioGroup label="Email summary" name="frequency" defaultValue="weekly">
          <Radio value="daily" label="Daily" />
          <Radio value="weekly" label="Weekly" />
          <Radio value="never" label="Never" />
        </RadioGroup>
        {/* envUI has no checkbox group yet: a fieldset and its legend name the choices, and are
            read with each one, as RadioGroup's are. */}
        <fieldset style={{ minInlineSize: 0, margin: 0, padding: 0, border: 0 }}>
          {/* The legend keeps RadioGroup's space below it. */}
          <legend style={{ padding: 0, marginBlockEnd: 'var(--env-space-4)' }}>
            Notify me about
          </legend>
          <Stack gap={3}>
            <Checkbox
              name="topics"
              value="comments"
              label="Comments on my documents"
              defaultChecked
            />
            <Checkbox name="topics" value="mentions" label="Mentions" defaultChecked />
            <Checkbox name="topics" value="assignments" label="Tasks assigned to me" />
            <Checkbox name="topics" value="due" label="Tasks due tomorrow" />
          </Stack>
        </fieldset>
        <Stack direction="row" wrap gap={3}>
          <Button type="submit">Save preferences</Button>
        </Stack>
        <Text role="status" emphasis="muted">
          {saved}
        </Text>
      </Stack>
    </form>
  );
}
