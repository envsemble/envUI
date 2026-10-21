import { Button, Card, EmptyState, Row } from '@envsemble/envui';

export default function CompetingActions() {
  return (
    <Card style={{ inlineSize: 'min(100%, 22rem)' }}>
      <EmptyState
        headingLevel={3}
        title="No members yet"
        description="Invite people to work on Northwind launch."
        action={
          <Row wrap gap={2}>
            <Button>Invite people</Button>
            <Button variant="secondary">Import a list</Button>
            <Button variant="secondary">Share a link</Button>
            <Button variant="text">Learn about roles</Button>
          </Row>
        }
      />
    </Card>
  );
}
