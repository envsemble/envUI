import { useState, type FormEvent } from 'react';
import { Button, MonthPicker, Stack, Text } from '@envsemble/envui';

export default function ExpenseForm() {
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSent(`Expenses for ${String(data.get('period'))} submitted.`);
  };
  return (
    <form onSubmit={submit} onReset={() => setSent('')} style={{ inlineSize: 'min(100%, 16rem)' }}>
      <Stack>
        <MonthPicker label="Period" name="period" placeholder="Choose a month" required />
        <Stack direction="row" wrap align="center" gap={4}>
          <Button type="submit">Submit expenses</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Stack>
        <Text variant="caption" emphasis="muted" role="status">
          {sent}
        </Text>
      </Stack>
    </form>
  );
}
