import { useState } from 'react';
import { Text, Button, EmptyState, Skeleton, LoadingState, Dialog, Stack } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Search } from '@envsemble/envui/icons/Search';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function EmptyStatePreview() {
  const [actionResult, setActionResult] = useState('');
  return (
    <Preview>
      <Example title="Empty content" size="collection">
        <SpecimenGrid size="card">
          <Specimen title="First project">
            <EmptyState
              icon={<Apps />}
              title="No projects yet"
              description="Create a project to bring plans and people together."
              action={
                <Button
                  startIcon={<Add />}
                  onClick={() => setActionResult('Project creation started')}
                >
                  Create project
                </Button>
              }
            />
          </Specimen>
          <Specimen title="No search results">
            <EmptyState
              icon={<Search />}
              title="No matching projects"
              description="Try another name or clear the filters."
              action={
                <Button variant="secondary" onClick={() => setActionResult('Filters cleared')}>
                  Clear filters
                </Button>
              }
            />
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {actionResult}
        </Text>
      </Example>
    </Preview>
  );
}

export function LoadingPreview() {
  return (
    <Preview>
      <Example
        title="Loading placeholders"
        size="collection"
        caption="Match the expected content size to reduce layout shifts. One loading announcement per region."
      >
        <SpecimenGrid size="card">
          <Specimen title="Text placeholders">
            <LoadingState label="Loading project">
              <Stack gap={2}>
                <Skeleton width="38%" height="1.25rem" />
                <Skeleton width="100%" height="0.8rem" />
                <Skeleton width="72%" height="0.8rem" />
              </Stack>
            </LoadingState>
          </Specimen>
          <Specimen title="Rows">
            <LoadingState label="Loading settings">
              <Stack>
                {[1, 2, 3].map((rowNumber) => (
                  <Skeleton key={rowNumber} width="100%" height="3.5rem" />
                ))}
              </Stack>
            </LoadingState>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function DialogsPreview() {
  const [activeDialog, setActiveDialog] = useState<'details' | 'delete' | 'inspector' | null>(null);
  const [actionResult, setActionResult] = useState('');
  return (
    <Preview>
      <Example
        title="Modal dialogs"
        size="collection"
        caption="Modals block page interaction and trap focus. Escape closes the dialog and returns focus to its trigger."
      >
        <SpecimenGrid size="compact">
          <Specimen title="Confirmation">
            <Dialog
              open={activeDialog === 'delete'}
              onOpenChange={(open) => setActiveDialog(open ? 'delete' : null)}
              trigger={<Button variant="secondary">Delete project</Button>}
              title="Delete project?"
              description="This removes the project for everyone in the workspace."
              closeLabel="Cancel"
              actions={
                <Button
                  variant="destructive"
                  onClick={() => {
                    setActiveDialog(null);
                    setActionResult('Project deleted');
                  }}
                >
                  Delete project
                </Button>
              }
            />
          </Specimen>
          <Specimen title="Content dialog">
            <Dialog
              open={activeDialog === 'details'}
              onOpenChange={(open) => setActiveDialog(open ? 'details' : null)}
              trigger={<Button variant="secondary">View project</Button>}
              title="Sample project"
              description="Project details"
              closeLabel="Close"
            >
              <Text>Shared plans, milestones and responsibilities for the project.</Text>
            </Dialog>
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {actionResult}
        </Text>
      </Example>
      <Example
        title="Side panel"
        caption="This non-modal panel leaves the page interactive. Outside clicks keep it open; Escape or Close dismisses it."
      >
        <Dialog
          open={activeDialog === 'inspector'}
          onOpenChange={(open) => setActiveDialog(open ? 'inspector' : null)}
          trigger={<Button variant="secondary">Inspect project</Button>}
          title="Project details"
          placement="right"
          modal={false}
          disablePointerDismissal
        >
          <Text>Shared plans and people for the sample project.</Text>
        </Dialog>
      </Example>
    </Preview>
  );
}
