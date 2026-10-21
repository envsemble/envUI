import { useState, type FormEvent } from 'react';
import { Button, DatePicker, Column, Row, Text } from '@envsemble/envui';

export default function LeaveRequest() {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const [first, last] = [String(data.get('first')), String(data.get('last'))];
    // Values are YYYY-MM-DD, so they compare as text.
    const invalid = first && last && last < first;
    setError(invalid ? 'Choose a last day on or after the first.' : undefined);
    setSent(invalid ? '' : `Requested ${first} to ${last}.`);
  };
  return (
    <form
      onSubmit={submit}
      onReset={() => {
        setError(undefined);
        setSent('');
      }}
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      <Column gap={4}>
        <DatePicker label="First day" name="first" defaultValue="2026-11-02" required />
        <DatePicker label="Last day" name="last" defaultValue="2026-11-06" required error={error} />
        <Row wrap align="center" gap={4}>
          <Button type="submit">Request leave</Button>
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
