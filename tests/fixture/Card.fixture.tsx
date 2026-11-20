import { useState } from 'react';
import { Badge, Button, Card, Grid, IconButton, Link, Row } from '@envsemble/envui';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

export const mount = 'standalone';

export default function CardFixture() {
  const [edits, setEdits] = useState(0);
  return (
    <Grid columns={{ min: '18rem' }} gap={4} className="fixture-section">
      <Card
        interactive
        data-testid="project-card"
        title={
          <Link href="#northwind" data-row-target>
            Northwind launch
          </Link>
        }
        meta={<Badge tone="success">Live</Badge>}
        headerEnd={
          <IconButton
            icon={<IconMoreVert />}
            aria-label="Project actions"
            onClick={() => setEdits((count) => count + 1)}
          />
        }
        description={
          <Row gap={2} render={<ul />}>
            <li>Web</li>
            <li>Mobile</li>
            <li>
              Owned by <Link href="#ana">Ana</Link>
            </li>
          </Row>
        }
        actions={<Button variant="secondary">Share</Button>}
      >
        <span data-testid="card-body">Ships on Friday.</span>
      </Card>
      <Card title="Design tokens" headerEnd={<Button>Edit</Button>} data-testid="end-card">
        <span data-testid="edits">{edits}</span>
      </Card>
    </Grid>
  );
}
