import { useRef, useState } from 'react';
import { Button, ConfirmDialog, Menu, Column, Text, TextField } from '@envsemble/envui';

export const mount = 'standalone';

export default function ConfirmDialogFixture() {
  const [log, setLog] = useState<string[]>([]);
  const [fail, setFail] = useState(true);
  const [error, setError] = useState('');
  const [fromMenu, setFromMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const record = (entry: string) => setLog((entries) => [...entries, entry]);
  const settle = useRef<(() => void) | null>(null);
  const [typedFail, setTypedFail] = useState(true);
  const [typedError, setTypedError] = useState('');
  const settleTyped = useRef<(() => void) | null>(null);
  const [repository, setRepository] = useState('');
  return (
    <Column gap={4} className="fixture-section">
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
          if (reason !== 'imperative-action') setSaving(open);
        }}
        title="Save the draft?"
        confirmLabel="Save draft"
        onConfirm={() => record('saved')}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          record('outer submit');
        }}
      >
        <ConfirmDialog
          trigger={<Button variant="secondary">Delete workspace</Button>}
          tone="danger"
          title="Delete the Acme workspace?"
          confirmLabel="Delete workspace"
          error={typedError || undefined}
          onConfirm={() => {
            record('delete workspace');
            return new Promise<void>((resolve, reject) => {
              settleTyped.current = () => {
                if (typedFail) {
                  setTypedError('The workspace could not be deleted. Try again.');
                  setTypedFail(false);
                  reject(new Error('failed'));
                } else resolve();
              };
            });
          }}
        >
          <TextField label="Workspace name" autoComplete="off" />
        </ConfirmDialog>
        <Button variant="secondary" onClick={() => settleTyped.current?.()}>
          Finish the workspace action
        </Button>
      </form>
      <ConfirmDialog
        trigger={<Button variant="secondary">Delete repository</Button>}
        tone="danger"
        title="Delete acme/api?"
        confirmLabel="Delete repository"
        confirmDisabled={repository !== 'acme/api'}
        onConfirm={() => record('delete repository')}
      >
        <TextField
          label="Repository name"
          autoComplete="off"
          value={repository}
          onValueChange={setRepository}
        />
      </ConfirmDialog>
      <ConfirmDialog
        trigger={<Button variant="secondary">Rename project</Button>}
        title="Rename Northwind launch?"
        confirmLabel="Rename project"
        onConfirm={() => record('renamed')}
      >
        <form aria-label="New name">
          <TextField label="Project name" autoComplete="off" />
        </form>
      </ConfirmDialog>
      <output data-testid="confirm-log">{log.join(',')}</output>
    </Column>
  );
}
