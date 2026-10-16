import { useState } from 'react';
import { Button, ConfirmButton, List, Stack } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];

export default function ConfirmInPlace() {
  const [members, setMembers] = useState(people);
  const [draftDeleted, setDraftDeleted] = useState(false);
  const remove = (name: string) =>
    setMembers((current) => current.filter((member) => member !== name));
  return (
    <Stack align="start">
      <List.Root aria-label="Members with access" style={{ inlineSize: 'min(100%, 24rem)' }}>
        {members.map((name) => (
          <List.Item
            key={name}
            title={name}
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
        <Button variant="text" onClick={() => setMembers(people)}>
          Restore members
        </Button>
      )}
      {draftDeleted ? (
        <Button variant="text" onClick={() => setDraftDeleted(false)}>
          Draft deleted. Restore
        </Button>
      ) : (
        <ConfirmButton
          icon={<Delete />}
          aria-label="Delete draft"
          confirmLabel="Delete draft?"
          onConfirm={() => setDraftDeleted(true)}
        />
      )}
    </Stack>
  );
}
