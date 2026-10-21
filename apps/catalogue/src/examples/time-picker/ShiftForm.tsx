import { useState, type FormEvent } from 'react';
import { Button, Column, Row, Text, TimePicker } from '@envsemble/envui';

export default function ShiftForm() {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const [from, to] = [String(data.get('from')), String(data.get('to'))];
    // Values are HH:mm on the 24-hour clock, so they compare as text.
    const invalid = from && to && to <= from;
    setError(invalid ? 'Choose an end after the start.' : undefined);
    setSent(invalid ? '' : `Shift from ${from} to ${to}.`);
  };
  return (
    <form
      onSubmit={submit}
      onReset={() => {
        setError(undefined);
        setSent('');
      }}
      style={{ inlineSize: 'min(100%, 16rem)' }}
    >
      <Column gap={4}>
        <TimePicker label="From" name="from" defaultValue="09:00" required />
        <TimePicker label="To" name="to" defaultValue="17:00" required error={error} />
        <Row wrap align="center" gap={4}>
          <Button type="submit">Save shift</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Row>
        <Text variant="caption" emphasis="muted" role="status">
          {sent}
        </Text>
      </Column>
    </form>
  );
}
