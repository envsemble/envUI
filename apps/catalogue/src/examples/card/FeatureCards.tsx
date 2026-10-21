import { Button, Card } from '@envsemble/envui';
import { UploadFile } from '@envsemble/envui/icons/UploadFile';

export default function FeatureCards() {
  return (
    <Card
      layout="feature"
      headingLevel={3}
      icon={<UploadFile />}
      title="Import your plans"
      description="Bring in spreadsheets and documents from another tool."
      actions={<Button variant="secondary">Import</Button>}
    />
  );
}
