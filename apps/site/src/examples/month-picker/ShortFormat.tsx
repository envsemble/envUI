import { MonthPicker } from '@envsemble/envui';

export default function ShortFormat() {
  return (
    <div style={{ inlineSize: 'min(100%, 12rem)' }}>
      <MonthPicker
        label="Expires"
        defaultValue="2028-07"
        formatOptions={{ month: '2-digit', year: '2-digit' }}
      />
    </div>
  );
}
