import { Progress } from '@envsemble/envui';

export default function PreparingExport() {
  return (
    <Progress label="Preparing export" value={null} style={{ inlineSize: 'min(100%, 22rem)' }} />
  );
}
