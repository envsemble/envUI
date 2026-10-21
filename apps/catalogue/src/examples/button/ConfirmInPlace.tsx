import { useEffect, useRef, useState } from 'react';
import { Button, ConfirmButton, List, Column } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];

export default function ConfirmInPlace() {
  const [members, setMembers] = useState(people);
  const [draftDeleted, setDraftDeleted] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const restoreMembers = useRef<HTMLButtonElement>(null);
  const draft = useRef<HTMLDivElement>(null);
  // A confirmed button goes away with what it removed, so focus moves on to what is there now.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });

  const remove = (name: string) => {
    const index = members.indexOf(name);
    focusNext.current = () => {
      const buttons = list.current?.querySelectorAll('button') ?? [];
      (buttons[Math.min(index, buttons.length - 1)] ?? restoreMembers.current)?.focus();
    };
    setMembers((current) => current.filter((member) => member !== name));
  };
  const restore = () => {
    focusNext.current = () => list.current?.querySelector('button')?.focus();
    setMembers(people);
  };
  const setDraft = (deleted: boolean) => {
    focusNext.current = () => draft.current?.querySelector('button')?.focus();
    setDraftDeleted(deleted);
  };

  return (
    <Column gap={4} align="start">
      <List.Root
        ref={list}
        aria-label="Members with access"
        style={{ inlineSize: 'min(100%, 24rem)' }}
      >
        {members.map((name) => (
          <List.Item
            key={name}
            label={name}
            action={
              <ConfirmButton
                confirmLabel={`Remove ${name.split(' ')[0]}?`}
                onConfirm={() => remove(name)}
              >
                Remove
              </ConfirmButton>
            }
          />
        ))}
      </List.Root>
      {members.length === 0 && (
        <Button ref={restoreMembers} variant="text" onClick={restore}>
          Restore members
        </Button>
      )}
      <div ref={draft}>
        {draftDeleted ? (
          <Button variant="text" onClick={() => setDraft(false)}>
            Draft deleted. Restore
          </Button>
        ) : (
          <ConfirmButton
            icon={<Delete />}
            aria-label="Delete draft"
            confirmLabel="Delete draft?"
            onConfirm={() => setDraft(true)}
          />
        )}
      </div>
    </Column>
  );
}
