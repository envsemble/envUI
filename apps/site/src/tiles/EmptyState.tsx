import { Button, EmptyState } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';

export default function EmptyStateTile() {
  return (
    <EmptyState
      icon={<IconFolder />}
      title="No projects yet"
      description="Projects you create show here."
      actions={<Button size="sm">Create project</Button>}
    />
  );
}
