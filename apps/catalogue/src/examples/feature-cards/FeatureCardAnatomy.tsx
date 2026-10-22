import { Button, Card, Column, Row, Text } from '@envsemble/envui';
import { UploadFile } from '@envsemble/envui/icons/UploadFile';

export default function FeatureCardAnatomy() {
  return (
    <Card style={{ inlineSize: 'min(100%, 36rem)' }}>
      <Row wrap align="center" gap={4}>
        <Text render={<span />} emphasis="muted">
          <UploadFile width="1.5rem" height="1.5rem" />
        </Text>
        <Column gap={1} style={{ flex: '1 1 16rem' }}>
          <Text render={<h3 />} variant="headline">
            Import your plans
          </Text>
          <Text variant="body-sm">Bring in spreadsheets and documents from another tool.</Text>
        </Column>
        <Button variant="secondary">Import</Button>
      </Row>
    </Card>
  );
}
