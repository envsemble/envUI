import { Button, Card, Text } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

export function CardsFixture() {
  return (
    <section className="fixture-section">
      <h2>Standalone responsive cards</h2>
      {[true, false].map((withIcon) => (
        <Card
          layout="feature"
          key={String(withIcon)}
          data-testid={`standalone-feature-${withIcon ? 'icon' : 'plain'}`}
          icon={withIcon ? <ChevronRight /> : undefined}
          title="Connected workspace"
          description="Supporting details"
          actions={<Button>Open workspace</Button>}
          style={{ width: '100%' }}
        />
      ))}
      <h2>Headings and elements</h2>
      <Card title="Default level" description="A sentence under it." data-testid="card-h3" />
      <Card title="Fourth level" headingLevel={4} data-testid="card-h4" />
      <Card
        layout="feature"
        title="Feature heading"
        headingLevel={3}
        actions={<Button>Go</Button>}
        data-testid="feature-h3"
      />
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
