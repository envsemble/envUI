import { Button, Card, Column, Row, Text } from '@envsemble/envui';
import { Groups } from '@envsemble/envui/icons/Groups';

export default function OneAction() {
  return (
    <Card>
      <Row wrap align="center" gap={4}>
        <Text render={<span />} emphasis="muted">
          <Groups width="1.5rem" height="1.5rem" />
        </Text>
        <Column gap={1} style={{ flex: '1 1 12rem' }}>
          <Text render={<h3 />} variant="headline">
            Invite your team
          </Text>
          <Text variant="body-sm">Plans and files stay in one place.</Text>
        </Column>
        <Button>Invite people</Button>
      </Row>
    </Card>
  );
}
