import { useRef, useState } from 'react';
import { Button, ConfirmDialog, Menu, Stack, Text } from '@envsemble/envui';

/**
 * Confirm dialogs, mounted with ?fixture=confirm-dialogs: a neutral one that confirms at once, a
 * danger one whose action takes a moment and can fail, one whose action resolves at once, one
 * opened from a menu item that returns focus to the menu's button, and a controlled one that
 * stays open after its action.
 */
export function ConfirmDialogsFixture() {
  const [log, setLog] = useState<string[]>([]);
  const [fail, setFail] = useState(true);
  const [error, setError] = useState('');
  const [fromMenu, setFromMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const record = (entry: string) => setLog((entries) => [...entries, entry]);
  // The action waits until the spec lets it finish, so the pending state can be checked.
  const settle = useRef<(() => void) | null>(null);
  return (
    <Stack gap={4} className="fixture-section">
      <ConfirmDialog
        trigger={<Button variant="secondary">Archive project</Button>}
        title="Archive Northwind launch?"
        description="People can still find it under Archived."
        confirmLabel="Archive project"
        onConfirm={() => record('archived')}
        onOpenChange={(open, { reason }) => record(`${open ? 'open' : 'close'} ${reason}`)}
      />
      <ConfirmDialog
        trigger={<Button variant="secondary">Delete project</Button>}
        tone="danger"
        title="Delete Northwind launch?"
        description="This deletes the project and its files for everyone."
        confirmLabel="Delete project"
        error={error || undefined}
        onOpenChange={(open) => {
          if (!open) setError('');
        }}
        onConfirm={() =>
          new Promise<void>((resolve, reject) => {
            settle.current = () => {
              if (fail) {
                setError('The project could not be deleted. Try again.');
                setFail(false);
                reject(new Error('failed'));
              } else {
                record('deleted');
                resolve();
              }
            };
          })
        }
      />
      <ConfirmDialog
        trigger={<Button variant="secondary">Duplicate project</Button>}
        title="Duplicate Northwind launch?"
        confirmLabel="Duplicate project"
        onConfirm={async () => {
          record('duplicated');
        }}
      />
      <Button variant="secondary" onClick={() => settle.current?.()}>
        Finish the action
      </Button>
      <Menu.Root
        aria-label="Project actions"
        trigger={
          <Button ref={menuButton} variant="secondary">
            Project actions
          </Button>
        }
      >
        <Menu.Item onClick={() => setFromMenu(true)}>Remove member…</Menu.Item>
      </Menu.Root>
      <ConfirmDialog
        open={fromMenu}
        onOpenChange={setFromMenu}
        title="Remove Sam Lee?"
        confirmLabel="Remove member"
        tone="danger"
        cancelLabel="Keep member"
        finalFocus={menuButton}
        onConfirm={() => record('removed')}
      >
        <Text>Sam loses access to Northwind launch.</Text>
      </ConfirmDialog>
      <ConfirmDialog
        trigger={<Button variant="secondary">Save draft</Button>}
        open={saving}
        onOpenChange={(open, { reason }) => {
          // Kept open after the action, so the draft can be saved again.
          if (reason !== 'imperative-action') setSaving(open);
        }}
        title="Save the draft?"
        confirmLabel="Save draft"
        onConfirm={() => record('saved')}
      />
      <output data-testid="confirm-log">{log.join(',')}</output>
    </Stack>
  );
}
