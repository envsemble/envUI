import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';

export default function PublishDate() {
  const [publishOn, setPublishOn] = useState<string | null>('2026-10-20');
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <DatePicker
        label="Publish on"
        description="The day the report goes out."
        value={publishOn}
        onValueChange={setPublishOn}
        clearable
      />
    </div>
  );
}
