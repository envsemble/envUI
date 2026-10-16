import { useEffect, useState } from 'react';
import {
  ActionGroup,
  Text,
  Button,
  EmptyState,
  IconButton,
  TextField,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  LoadingState,
  Dialog,
  Spinner,
  Stack,
  Surface,
  Kbd,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Search } from '@envsemble/envui/icons/Search';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Refresh } from '@envsemble/envui/icons/Refresh';
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
          <Specimen title="Failed to load">
            <EmptyState
              tone="error"
              title="Projects couldn’t load"
              description="Something went wrong. Please try again."
              action={
                <Button
                  variant="secondary"
                  startIcon={<Refresh />}
                  onClick={() => setActionResult('Retrying')}
                >
                  Try again
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
      <Example title="In place of a page’s content" size="collection">
        <Surface tone="pane" padding={0} style={{ display: 'grid', minBlockSize: '22rem' }}>
          <EmptyState
            align="center"
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
        </Surface>
      </Example>
    </Preview>
  );
}

/** Simulates work that ends after a short while. */
function useSimulatedWork(duration: number) {
  const [working, setWorking] = useState(false);
  useEffect(() => {
    if (!working) return;
    const timer = setTimeout(() => setWorking(false), duration);
    return () => clearTimeout(timer);
  }, [working, duration]);
  return [working, () => setWorking(true)] as const;
}

export function SpinnerPreview() {
  const [saving, save] = useSimulatedWork(1800);
  const [refreshing, refresh] = useSimulatedWork(1800);
  return (
    <Preview>
      <Example
        title="Work in place"
        size="collection"
        caption="A spinner shows work of unknown length in a small area. A pending button keeps its size and ignores repeated presses."
      >
        <SpecimenGrid>
          <Specimen title="Spinner sizes">
            <div className="docs-spinner-row">
              <Spinner size="small" label="Loading" />
              <Spinner label="Loading" />
              <Spinner size="large" label="Loading" />
            </div>
          </Specimen>
          <Specimen title="Pending actions">
            <ActionGroup>
              <Button pending={saving} onClick={save}>
                Save changes
              </Button>
              <IconButton
                icon={<Refresh />}
                aria-label="Refresh"
                pending={refreshing}
                onClick={refresh}
              />
            </ActionGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function SkeletonPreview() {
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
  const [activeDialog, setActiveDialog] = useState<
    'details' | 'delete' | 'inspector' | 'pending' | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [actionResult, setActionResult] = useState('');
  return (
    <Preview>
      <Example
        title="Modal dialogs"
        size="collection"
        caption={
          <>
            Modals block page interaction and trap focus. <Kbd>Esc</Kbd> closes the dialog and
            returns focus to its trigger.
          </>
        }
      >
        <SpecimenGrid size="compact">
          <Specimen title="Wide">
            <Dialog
              trigger={<Button variant="secondary">Review changes</Button>}
              title="Review changes"
              description="Wide dialogs suit tables, comparisons and longer forms."
              size="wide"
            >
              <Text>Three documents changed since your last review.</Text>
            </Dialog>
          </Specimen>
          <Specimen title="Near the top">
            <Dialog
              trigger={<Button variant="secondary">Find a plan</Button>}
              title="Find a plan"
              placement="top"
            >
              <TextField label="Plan name" name="plan" />
            </Dialog>
          </Specimen>
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
          <Specimen title="Pending work">
            <Dialog
              open={activeDialog === 'pending'}
              onOpenChange={(open) => setActiveDialog(open ? 'pending' : null)}
              trigger={<Button variant="secondary">Rename project</Button>}
              title="Rename project"
              description={
                <>
                  Saving keeps the dialog open; Cancel and <Kbd>Esc</Kbd> wait until it finishes.
                </>
              }
              closeLabel="Cancel"
              pending={saving}
              actions={
                <Button
                  pending={saving}
                  onClick={() => {
                    setSaving(true);
                    window.setTimeout(() => {
                      setSaving(false);
                      setActiveDialog(null);
                      setActionResult('Project renamed');
                    }, 2000);
                  }}
                >
                  Save
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
      <FormDialogExamples />
      <Example
        title="Side panel"
        caption={
          <>
            This non-modal panel leaves the page interactive. Outside clicks keep it open;{' '}
            <Kbd>Esc</Kbd> or Close dismisses it.
          </>
        }
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

const roleOptions = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
] as const;

/** Dialogs that collect input: fields, a choice and a typed confirmation. */
function FormDialogExamples() {
  const [activeDialog, setActiveDialog] = useState<'invite' | 'role' | 'remove' | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [inviting, setInviting] = useState(false);
  const [role, setRole] = useState('member');
  const [confirmation, setConfirmation] = useState('');
  const [result, setResult] = useState('');
  function open(dialog: 'invite' | 'role' | 'remove' | null) {
    setActiveDialog(dialog);
    setEmail('');
    setEmailError(undefined);
    setConfirmation('');
  }
  function invite() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError('Enter an e-mail address such as name@example.com.');
      return;
    }
    setInviting(true);
    window.setTimeout(() => {
      setInviting(false);
      setActiveDialog(null);
      setResult(`Invitation sent to ${email}`);
    }, 1500);
  }
  return (
    <Example
      title="Dialogs with forms"
      size="collection"
      caption="Fields keep their floating labels and validation inside the dialog. The primary action stays pending while the work runs, and Cancel waits for it."
    >
      <SpecimenGrid size="compact">
        <Specimen title="Fields and validation">
          <Dialog
            open={activeDialog === 'invite'}
            onOpenChange={(next) => open(next ? 'invite' : null)}
            trigger={<Button variant="secondary">Invite member</Button>}
            title="Invite member"
            description="We'll send an invitation with a link to join the workspace."
            closeLabel="Cancel"
            pending={inviting}
            actions={
              <Button pending={inviting} onClick={invite}>
                Send invitation
              </Button>
            }
          >
            <Stack gap={4}>
              <TextField
                label="E-mail address"
                type="email"
                autoComplete="off"
                value={email}
                error={emailError}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError(undefined);
                }}
              />
              <Select
                variant="outlined"
                label="Role"
                hint="Admins also manage members and billing."
                options={roleOptions}
                defaultValue="member"
              />
            </Stack>
          </Dialog>
        </Specimen>
        <Specimen title="A choice">
          <Dialog
            open={activeDialog === 'role'}
            onOpenChange={(next) => open(next ? 'role' : null)}
            trigger={<Button variant="secondary">Change role</Button>}
            title="Change role"
            description="Alex Morgan keeps access to the projects they already have."
            closeLabel="Cancel"
            actions={
              <Button
                onClick={() => {
                  setActiveDialog(null);
                  setResult(`Role changed to ${role}`);
                }}
              >
                Save
              </Button>
            }
          >
            <RadioGroup variant="rows" label="Role" value={role} onValueChange={setRole}>
              <Radio value="member" label="Member" detail="Uses the products assigned to them." />
              <Radio value="admin" label="Admin" detail="Also manages members and billing." />
            </RadioGroup>
          </Dialog>
        </Specimen>
        <Specimen title="Typed confirmation">
          <Dialog
            open={activeDialog === 'remove'}
            onOpenChange={(next) => open(next ? 'remove' : null)}
            trigger={<Button variant="secondary">Remove workspace</Button>}
            title="Remove workspace?"
            description="This deletes Northwind and its projects for everyone. It cannot be undone."
            closeLabel="Cancel"
            actions={
              <Button
                variant="destructive"
                disabled={confirmation !== 'Northwind'}
                onClick={() => {
                  setActiveDialog(null);
                  setResult('Workspace removed');
                }}
              >
                Remove workspace
              </Button>
            }
          >
            <TextField
              label="Workspace name"
              hint="Type Northwind to confirm."
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </Dialog>
        </Specimen>
      </SpecimenGrid>
      <Text variant="caption" className="docs-caption" aria-live="polite">
        {result}
      </Text>
    </Example>
  );
}
