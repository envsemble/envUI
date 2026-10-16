import { Button, EmptyState, Surface } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

export default function InPlaceOfContent() {
  return (
    // The region a list would fill; the state centres itself in the height it gets.
    <Surface tone="pane" padding={0} style={{ display: 'grid', minBlockSize: '22rem' }}>
      <EmptyState
        align="center"
        headingLevel={2}
        icon={<FolderOpen />}
        title="No projects yet"
        description="Projects bring plans, files and people together. Create one to get started."
        action={<Button startIcon={<Add />}>Create project</Button>}
      />
    </Surface>
  );
}
