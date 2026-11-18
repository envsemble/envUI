import { Column, Progress, Text } from '@envsemble/envui';

export default function OneBarForBatch() {
  return (
    <Column gap={2} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Progress label="Uploading 3 files" value={2} max={3} valueText="2 of 3 files" />
      <Text variant="body-sm" emphasis="muted">
        budget.xlsx, brief.docx, logo.svg
      </Text>
    </Column>
  );
}
