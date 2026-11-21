import { Halo, Button, Column, Text } from '@envsemble/envui';

export default function InviteTeam() {
  return (
    <Column gap={3} align="start" style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Text variant="title" render={<h3 />}>
        Website refresh
      </Text>
      <Text emphasis="muted">Invite the people who work on this project to get started.</Text>
      <Halo>
        <Button>Invite people</Button>
      </Halo>
    </Column>
  );
}
