import { Button, Card, EmptyState } from '@envsemble/envui';

export default function ErrorCode() {
  return (
    <Card style={{ inlineSize: 'min(100%, 22rem)' }}>
      <EmptyState
        tone="danger"
        headingLevel={3}
        title="Oops! Error 503"
        description="Something went wrong."
        action={<Button variant="secondary">OK</Button>}
      />
    </Card>
  );
}
