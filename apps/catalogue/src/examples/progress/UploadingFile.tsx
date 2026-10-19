import { Progress } from '@envsemble/envui';

export default function UploadingFile() {
  return <Progress label="Uploading quarterly-report.pdf" value={40} valueText="40%" />;
}
