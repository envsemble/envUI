import { Progress } from '@envsemble/envui';

export default function PreparingExport() {
  return (
    // null while the amount of work is unknown.
    <Progress label="Preparing export" value={null} style={{ inlineSize: 'min(100%, 22rem)' }} />
  );
}
