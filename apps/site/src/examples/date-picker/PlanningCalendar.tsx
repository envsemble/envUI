import { useState } from 'react';
import { Calendar } from '@envsemble/envui';

export default function PlanningCalendar() {
  const [day, setDay] = useState<string | null>('2026-10-20');
  return <Calendar aria-label="Planning" value={day} onValueChange={setDay} />;
}
