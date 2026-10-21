import { Button, Card, EmptyState } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function SayWhatHappened() {
  return (
    <Card style={{ inlineSize: 'min(100%, 22rem)' }}>
      <EmptyState
        tone="danger"
        headingLevel={3}
        title="Projects couldn’t load"
        description="Your projects are safe. Check your connection and try again."
        action={
          <Button variant="secondary" startIcon={<Refresh />}>
            Try again
          </Button>
        }
      />
    </Card>
  );
}
