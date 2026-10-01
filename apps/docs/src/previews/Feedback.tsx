import { useState } from 'react';
import {
  Text,
  Theme,
  Button,
  Card,
  Surface,
  EmptyState,
  Skeleton,
  LoadingState,
  Input,
  Tabs,
  Dialog,
  Toast,
  ToastProvider,
  useToast,
  Stack,
  ActionGroup,
} from '@envsemble/envui';
import { Add, Search, Apps } from '@envsemble/envui/icons';
import { Example, Specimen, SpecimenGrid } from './Example';
import { PairedThemes, type Appearance } from './PairedThemes';

function ManagedControls() {
  const toast = useToast();
  return (
    <Stack>
      <ActionGroup>
        <Button
          onClick={() =>
            toast.show({ variant: 'success', message: 'Changes saved', placement: 'bottom-right' })
          }
        >
          Bottom right notice
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.show({
              variant: 'info',
              message: 'A new version is available',
              placement: 'top-center',
            })
          }
        >
          Top center notice
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast.show({
              variant: 'error',
              message: 'Could not save changes',
              action: {
                label: 'Retry',
                onClick: () => toast.show({ variant: 'success', message: 'Changes saved' }),
              },
            })
          }
        >
          Persistent error
        </Button>
        <Button variant="secondary" onClick={() => toast.clear()}>
          Clear notices
        </Button>
      </ActionGroup>
      <Text variant="caption" className="docs-caption">
        Show several notices to explore the queue. Hover or focus a notice to pause its timer.
      </Text>
    </Stack>
  );
}

function ManagedToastExample() {
  return (
    <Example title="Managed delivery" className="docs-managed-toast" gap={5}>
      <Tabs
        aria-label="Notification appearance"
        defaultValue="light"
        items={(['light', 'dark'] as const).map((theme) => ({
          value: theme,
          button: <Button>{theme === 'light' ? 'Light' : 'Dark'} appearance</Button>,
          content: (
            <Theme theme={theme}>
              <Surface tone="canvas" padding={5}>
                <ToastProvider defaultPlacement="bottom-right">
                  <ManagedControls />
                </ToastProvider>
              </Surface>
            </Theme>
          ),
        }))}
      />
    </Example>
  );
}

export function EmptyStatePreview() {
  const [actionResult, setActionResult] = useState('');
  return (
    <PairedThemes>
      {() => (
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
      )}
    </PairedThemes>
  );
}

export function LoadingPreview() {
  return (
    <PairedThemes>
      {() => (
        <Example title="Loading placeholders" size="collection">
          <SpecimenGrid size="card">
            <Specimen title="Content card">
              <Card>
                <LoadingState label="Loading project">
                  <Stack gap={2}>
                    <Skeleton width="38%" height="1.25rem" />
                    <Skeleton width="100%" height="0.8rem" />
                    <Skeleton width="72%" height="0.8rem" />
                  </Stack>
                </LoadingState>
              </Card>
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
      )}
    </PairedThemes>
  );
}

const toastExamples = [
  { variant: 'neutral', message: 'Changes saved' },
  { variant: 'success', message: 'Project created' },
  { variant: 'info', message: 'A new version is available' },
  { variant: 'error', message: 'Could not save changes' },
] as const;

export function ToastsPreview() {
  const [dismissedVariants, setDismissedVariants] = useState<string[]>([]);
  const [actionResult, setActionResult] = useState('');
  return (
    <>
      <PairedThemes>
        {() => (
          <>
            <Example title="Manual notices">
              <Stack>
                {toastExamples
                  .filter(({ variant }) => !dismissedVariants.includes(variant))
                  .map(({ variant, message }) => (
                    <Toast
                      key={variant}
                      announce={false}
                      variant={variant}
                      message={message}
                      action={
                        variant === 'error'
                          ? {
                              label: 'Retry',
                              onClick: () => setActionResult('Retry requested'),
                            }
                          : undefined
                      }
                      onDismiss={() =>
                        setDismissedVariants((currentVariants) => [...currentVariants, variant])
                      }
                    />
                  ))}
                <Button variant="secondary" onClick={() => setDismissedVariants([])}>
                  Restore examples
                </Button>
                <Text variant="caption" className="docs-caption" aria-live="polite">
                  {actionResult}
                </Text>
              </Stack>
            </Example>
          </>
        )}
      </PairedThemes>
      <ManagedToastExample />
    </>
  );
}

export function DialogsPreview() {
  const [projectName, setProjectName] = useState('Autumn release');

  const [activeDialog, setActiveDialog] = useState<{
    theme: Appearance;
    kind: 'create' | 'delete';
  } | null>(null);
  const [actionResult, setActionResult] = useState('');
  return (
    <PairedThemes>
      {(theme) => (
        <Example title="Modal dialogs" size="collection">
          <SpecimenGrid size="compact">
            <Specimen title="Confirmation">
              <Dialog
                open={activeDialog?.theme === theme && activeDialog.kind === 'delete'}
                onOpenChange={(open) => setActiveDialog(open ? { theme, kind: 'delete' } : null)}
                trigger={<Button variant="destructive">Delete project</Button>}
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
            <Specimen title="Form">
              <Dialog
                open={activeDialog?.theme === theme && activeDialog.kind === 'create'}
                onOpenChange={(open) => setActiveDialog(open ? { theme, kind: 'create' } : null)}
                trigger={<Button startIcon={<Add />}>Create project</Button>}
                title="Create project"
                description="Choose a name your team will recognize."
                closeLabel="Cancel"
                actions={
                  <Button
                    onClick={() => {
                      setActiveDialog(null);
                      setActionResult(`Created ${projectName || 'project'}`);
                    }}
                  >
                    Create
                  </Button>
                }
              >
                <Input
                  label="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </Dialog>
            </Specimen>
          </SpecimenGrid>
          <Text variant="caption" className="docs-caption" aria-live="polite">
            {actionResult}
          </Text>
        </Example>
      )}
    </PairedThemes>
  );
}
