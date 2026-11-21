import { Halo, Button, Card, Column, Row, Text } from '@envsemble/envui';

export default function HaloFixture() {
  return (
    <Column gap={6} className="fixture-section">
      <Row gap={4} align="center">
        <Halo data-testid="halo">
          <Button data-testid="wrapped">Invite people</Button>
        </Halo>
        <Button data-testid="plain">Invite people</Button>
      </Row>
      <Column data-testid="column" gap={4} style={{ inlineSize: '20rem' }}>
        <Halo render={<div />} data-testid="block">
          <Card title="Northwind launch" data-testid="wrapped-card">
            <Text>Plans for the spring launch.</Text>
          </Card>
        </Halo>
      </Column>
      <div style={{ position: 'relative', blockSize: '6rem' }}>
        <Halo
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
