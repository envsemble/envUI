import { Box, Button, Column, Text } from '@envsemble/envui';

export default function OneInset() {
  return (
    <Box padding={5} name="invitation">
      <Column gap={3} align="start">
        <Text render={<h3 />} variant="title">
          Invite your team
        </Text>
        <Text>Projects are easier with the people who work on them.</Text>
        <Button variant="secondary">Invite people</Button>
      </Column>
    </Box>
  );
}
