import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';

export default function StartTime() {
  const [start, setStart] = useState<string | null>('09:30');
  return (
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <TimePicker
        label="Starts at"
        description="When the workshop begins."
        // On a 12-hour clock, as people write it in the United States.
        locale="en-US"
        value={start}
        onValueChange={setStart}
        clearable
      />
    </div>
  );
}
