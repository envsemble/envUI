import { useState } from 'react';
import { Button, Column, IconButton, Row, Surface, Text } from '@envsemble/envui';
import { IconClose } from '@envsemble/envui/icons/Close';

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
        <IconButton
          variant="ghost"
          icon={<IconClose />}
          aria-label="Dismiss tip"
          onClick={() => setOpen(false)}
        />
      </Row>
    </Surface>
  );
}
