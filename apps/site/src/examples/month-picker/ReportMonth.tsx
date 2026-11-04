import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';

export default function ReportMonth() {
  const [month, setMonth] = useState<string | null>('2026-10');
  return (
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <MonthPicker
        label="Report month"
        variant="floating"
        description="The month the report covers."
        value={month}
        onValueChange={setMonth}
        clearable
      />
    </div>
  );
}
