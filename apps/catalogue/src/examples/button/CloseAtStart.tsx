import { Column, IconButton, Row, Surface, Text } from '@envsemble/envui';
import { Close } from '@envsemble/envui/icons/Close';

export default function CloseAtStart() {
  return (
    <Surface background="muted" padding={4} style={{ maxInlineSize: '22rem' }}>
      <Row align="start" gap={3}>
        <IconButton variant="ghost" icon={<Close />} aria-label="Dismiss tip" />
        <Column gap={1} style={{ flex: '1 1 auto' }}>
          <Text variant="title" render={<h3 />}>
            Invite your team
          </Text>
          <Text variant="body-sm">Projects are easier to follow with everyone in them.</Text>
        </Column>
      </Row>
    </Surface>
  );
}
