import { Button, EmptyState, Surface } from '@envsemble/envui';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';

export default function NoMatches() {
  return (
    <Surface background="muted" style={{ blockSize: '14rem' }}>
      <EmptyState
        icon={<IconSearchOff />}
        title="No matching files"
        description="Nothing matches “roadmap” in this folder."
        actions={<Button>Clear search</Button>}
      />
    </Surface>
  );
}
