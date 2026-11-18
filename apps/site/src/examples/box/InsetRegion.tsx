import { Box, Button, Column, Text } from '@envsemble/envui';

export default function InsetRegion() {
  return (
    <Box name="invitation" padding={5} render={<section aria-labelledby="invitation-heading" />}>
      <Column gap={3} align="start">
        <Text render={<h3 />} variant="title" id="invitation-heading">
          Invite your team
        </Text>
        <Text>Projects are easier with the people who work on them.</Text>
        <Button variant="secondary">Invite people</Button>
      </Column>
    </Box>
  );
}
