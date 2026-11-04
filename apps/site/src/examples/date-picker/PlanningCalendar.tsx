import { useState } from 'react';
import { Calendar } from '@envsemble/envui';

export default function PlanningCalendar() {
  const [day, setDay] = useState<string | null>(null);
  return <Calendar aria-label="Planning" value={day} onValueChange={setDay} />;
}
