import { DatePicker } from '@envsemble/envui';

export default function WithinRange() {
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <DatePicker
        label="Review by"
        description="Between October 14 and December 18."
        placeholder="Choose a day"
        min="2026-10-14"
        max="2026-12-18"
      />
    </div>
  );
}
