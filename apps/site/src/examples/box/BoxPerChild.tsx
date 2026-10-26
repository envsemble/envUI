import { Box, Button, Text } from '@envsemble/envui';

export default function BoxPerChild() {
  return (
    <Box padding={5} name="invitation">
      <Box padding={1}>
        <Text render={<h3 />} variant="title">
          Invite your team
        </Text>
      </Box>
      <Box padding={2}>
        <Text>Projects are easier with the people who work on them.</Text>
      </Box>
      <Box padding={6}>
        <Button variant="secondary">Invite people</Button>
      </Box>
    </Box>
  );
}
