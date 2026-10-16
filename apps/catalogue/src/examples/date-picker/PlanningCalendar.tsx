import { useState } from 'react';
import { Calendar, Stack, Text } from '@envsemble/envui';

export default function PlanningCalendar() {
  const [day, setDay] = useState<string | null>(null);
  return (
    <Stack gap={3} align="start">
      <Calendar aria-label="Planning" value={day} onValueChange={setDay} />
      <Text variant="caption" tone="muted" role="status">
        {day ? `Planning ${day}.` : 'No day chosen yet.'}
      </Text>
    </Stack>
  );
}
