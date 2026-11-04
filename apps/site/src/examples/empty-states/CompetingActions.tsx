import { Button, Column, Row, Text } from '@envsemble/envui';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';

export default function CompetingActions() {
  return (
    // Three actions compete, and none says which ends the state.
    <Column gap={4} padding={5}>
      <Text render={<span />} emphasis="muted">
        <IconFolderOpen width="1.5rem" height="1.5rem" />
      </Text>
      <Column gap={2}>
        <Text render={<h3 />} variant="title">
          No projects yet
        </Text>
        <Text variant="body-sm">Projects keep a team's documents and tasks together.</Text>
      </Column>
      <Row gap={2} wrap>
        <Button variant="primary">Create project</Button>
        <Button variant="primary">Import projects</Button>
        <Button variant="primary">Watch a video</Button>
      </Row>
    </Column>
  );
}
