import { Button, Column, Text } from '@envsemble/envui';

export default function CenteredContent() {
  return (
    <Column gap={3} align="center">
      <Text render={<h3 />} variant="title">
        Invitation sent
      </Text>
      <Text>Priya Shah can join the workspace once she accepts.</Text>
      <Button variant="secondary">Invite someone else</Button>
    </Column>
  );
}
