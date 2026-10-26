import { Progress } from '@envsemble/envui';

export default function ProgressAnatomy() {
  return (
    <Progress
      label="Uploading quarterly-report.pdf"
      value={40}
      valueText="40%"
      style={{ inlineSize: 'min(100%, 22rem)' }}
    />
  );
}
