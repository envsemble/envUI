import { Progress } from '@envsemble/envui';

export default function LongTaskName() {
  return <Progress label="Uploading quarterly-report-final.pdf" value={40} valueText="40%" />;
}
