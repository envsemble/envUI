import { Progress } from '@envsemble/envui';

export default function PreparingExport() {
  // null while the amount of work is unknown.
  return <Progress label="Preparing export" value={null} />;
}
