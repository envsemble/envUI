import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';

export default function MeetingTime() {
  const [meeting, setMeeting] = useState<string | null>('2026-10-21T09:30');
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <DatePicker
        label="Meeting"
        withTime
        defaultTime="09:00"
        value={meeting}
        onValueChange={setMeeting}
        clearable
      />
    </div>
  );
}
