import { Button, EmptyState, Surface } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';

export default function NoProjects() {
  return (
    <Surface background="muted" style={{ inlineSize: 'min(100%, 32rem)', blockSize: '18rem' }}>
      <EmptyState
        icon={<IconFolder />}
        title="No projects yet"
        description="Projects you create or join show here."
        actions={<Button variant="primary">Create project</Button>}
      />
    </Surface>
  );
}
