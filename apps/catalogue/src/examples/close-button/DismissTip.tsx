import { useState } from 'react';
import { Button, CloseButton, Column, Row, Surface, Text } from '@envsemble/envui';

export default function DismissTip() {
  const [open, setOpen] = useState(true);
  if (!open)
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Show the tip again
      </Button>
    );
  return (
    <Surface background="muted" padding={4} style={{ maxInlineSize: '28rem' }}>
      <Row align="start" gap={3}>
        {/* The text takes the room the button leaves. */}
        <Column gap={1} style={{ flex: '1 1 auto' }}>
          <Text variant="title" render={<h3 />}>
            Invite your team
          </Text>
          <Text variant="body-sm">Projects are easier to follow with everyone in them.</Text>
        </Column>
        <CloseButton aria-label="Dismiss tip" onClick={() => setOpen(false)} />
      </Row>
    </Surface>
  );
}
