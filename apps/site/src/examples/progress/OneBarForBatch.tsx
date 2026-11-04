import { Card, Column, Progress, Text } from '@envsemble/envui';

export default function OneBarForBatch() {
  return (
    <Card title="Uploading 3 files" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Column gap={3}>
        <Progress label="Uploading" value={2} max={3} valueText="2 of 3 files" />
        <Text variant="body-sm" emphasis="muted">
          budget.xlsx, brief.docx, logo.svg
        </Text>
      </Column>
    </Card>
  );
}
