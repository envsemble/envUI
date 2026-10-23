import { useState } from 'react';
import { Calendar, Column, Text } from '@envsemble/envui';

export default function PlanningCalendar() {
  const [day, setDay] = useState<string | null>(null);
  return (
    <Column gap={3} align="start">
      <Calendar aria-label="Planning" value={day} onValueChange={setDay} />
      <Text variant="caption" emphasis="muted" role="status">
        {day ? `Planning ${day}.` : 'No day chosen yet.'}
      </Text>
    </Column>
  );
}
