import { useState } from 'react';
import { Button, Slider, Column, Row, Text, TextField } from '@envsemble/envui';

export default function SessionTimeout() {
  const [saved, setSaved] = useState('');
  return (
    <form
      // As wide as a form column.
      style={{ inlineSize: 'min(100%, 24rem)' }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaved(
          `${String(data.get('workspace'))} signs members out after ${String(data.get('timeout'))} minutes without activity.`,
        );
      }}
      onReset={() => setSaved('')}
    >
      <Column gap={5}>
        {/* The slider is as tall as the field above it, with the same corners. */}
        <TextField label="Workspace" name="workspace" defaultValue="Northwind" />
        <Slider
          label="Sign out after"
          description="Minutes without activity, from 10 to 120."
          name="timeout"
          min={10}
          max={120}
          step={10}
          defaultValue={30}
          formatValue={(value) => `${value} min`}
        />
        <Row wrap align="center" gap={4}>
          <Button type="submit">Save</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Row>
        <Text role="status">{saved}</Text>
      </Column>
    </form>
  );
}
