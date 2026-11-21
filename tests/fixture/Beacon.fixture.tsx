import { Beacon, Button, Card, Column, Row, Text } from '@envsemble/envui';

export default function BeaconFixture() {
  return (
    <Column gap={6} className="fixture-section">
      <Row gap={4} align="center">
        <Beacon data-testid="beacon">
          <Button data-testid="wrapped">Invite people</Button>
        </Beacon>
        <Button data-testid="plain">Invite people</Button>
      </Row>
      <Column data-testid="column" gap={4} style={{ inlineSize: '20rem' }}>
        <Beacon render={<div />} data-testid="block">
          <Card title="Northwind launch" data-testid="wrapped-card">
            <Text>Plans for the spring launch.</Text>
          </Card>
        </Beacon>
      </Column>
      <div style={{ position: 'relative', blockSize: '6rem' }}>
        <Beacon
          data-testid="placed"
          style={{
            position: 'absolute',
            insetBlockStart: 16,
            insetInlineStart: 24,
            inlineSize: 120,
            blockSize: 40,
          }}
        />
      </div>
    </Column>
  );
}
