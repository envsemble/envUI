import { DatePicker } from '@envsemble/envui';

export const mount = 'standalone';

export default function TouchTargetsFixture() {
  return (
    <div style={{ padding: '2rem' }}>
      <DatePicker label="Due" clearable defaultValue="2026-11-20" />
    </div>
  );
}
