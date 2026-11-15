import { Button, Column, EmptyState } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';

export default function EmptyStateFixture() {
  return (
    <Column gap={4} className="fixture-section">
      <div data-testid="wide" style={{ display: 'flex', inlineSize: '40rem', blockSize: '20rem' }}>
        <EmptyState
          icon={<IconFolder />}
          title="No projects yet"
          description="Projects you create or join show here."
          actions={<Button>Create project</Button>}
        />
      </div>
      <div data-testid="narrow" style={{ inlineSize: '16rem', blockSize: '14rem' }}>
        <EmptyState
          icon={<IconFolder />}
          title="No projects yet"
          description="Projects you create or join show here."
          actions={<Button>Create project</Button>}
        />
      </div>
      <div data-testid="bare" style={{ inlineSize: '20rem' }}>
        <EmptyState title="Nothing here" icon={null} description={false} />
      </div>
    </Column>
  );
}
