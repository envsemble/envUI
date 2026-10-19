import { useState } from 'react';
import { Button, Slider, Stack, Text } from '@envsemble/envui';

export default function SessionTimeout() {
  const [saved, setSaved] = useState('');
  return (
    <form
      // As wide as a form column.
      style={{ inlineSize: 'min(100%, 24rem)' }}
      onSubmit={(event) => {
        event.preventDefault();
        const minutes = new FormData(event.currentTarget).get('timeout');
        setSaved(`Members are signed out after ${String(minutes)} minutes without activity.`);
      }}
      onReset={() => setSaved('')}
    >
      <Stack gap={5}>
        <Slider
          label="Sign out after"
          description="Minutes without activity, from 5 to 120."
          name="timeout"
          min={5}
          max={120}
          step={5}
          defaultValue={30}
          formatValue={(value) => `${value} min`}
        />
        <Stack direction="row" wrap align="center" gap={4}>
          <Button type="submit">Save</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Stack>
        <Text role="status">{saved}</Text>
      </Stack>
    </form>
  );
}
