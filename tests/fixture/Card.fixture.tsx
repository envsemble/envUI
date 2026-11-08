import { Button, Card, Text } from '@envsemble/envui';

export function CardsFixture() {
  return (
    <section className="fixture-section">
      <h2>Headings and elements</h2>
      <Card title="Default level" description="A sentence under it." data-testid="card-h3" />
      <Card title="Fourth level" headingLevel={4} data-testid="card-h4" />
      <Card
        render={<article />}
        title="An article"
        actions={<Button>Open</Button>}
        data-testid="article-card"
      />
      <Card href="#named" data-testid="named-link">
        <Text render={<span />} variant="title">
          Northwind launch
        </Text>
        <Text render={<span />} emphasis="muted">
          12 open tasks
        </Text>
      </Card>
    </section>
  );
}
