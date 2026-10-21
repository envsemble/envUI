import { Button, CloseButton, Column, Row, Surface, Text } from '@envsemble/envui';

export default function TwoCloses() {
  return (
    <Surface background="muted" padding={4} style={{ maxInlineSize: '22rem' }}>
      <Column gap={3}>
        <Row align="start" gap={3}>
          <Column gap={1} style={{ flex: '1 1 auto' }}>
            <Text variant="title" render={<h3 />}>
              Invite your team
            </Text>
            <Text variant="body-sm">Projects are easier to follow with everyone in them.</Text>
          </Column>
          <CloseButton aria-label="Dismiss tip" />
        </Row>
        <Row justify="end">
          <Button variant="secondary">Close</Button>
        </Row>
      </Column>
    </Surface>
  );
}
