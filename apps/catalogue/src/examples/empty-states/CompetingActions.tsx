import { Button, EmptyState, Row } from '@envsemble/envui';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

export default function CompetingActions() {
  return (
    // Three actions compete, and none says which ends the state.
    <EmptyState
      icon={<FolderOpen />}
      title="No projects yet"
      description="Projects keep a team's documents and tasks together."
      action={
        <Row gap={2} wrap justify="center">
          <Button variant="primary">Create project</Button>
          <Button variant="primary">Import projects</Button>
          <Button variant="primary">Watch a video</Button>
        </Row>
      }
      headingLevel={3}
    />
  );
}
