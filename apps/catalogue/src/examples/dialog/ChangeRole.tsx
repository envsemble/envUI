import { useState } from 'react';
import { Button, Dialog, Radio, RadioGroup, Stack, Text } from '@envsemble/envui';

const roleNames: Record<string, string> = { member: 'Member', admin: 'Admin' };

export default function ChangeRole() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('member');
  const [choice, setChoice] = useState(role);
  return (
    <Stack align="start">
      <Text>Alex Morgan · {roleNames[role]}</Text>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setChoice(role);
        }}
        trigger={<Button variant="secondary">Change role</Button>}
        title="Change role"
        description="Alex Morgan keeps access to the projects they already have."
        closeLabel="Cancel"
        actions={
          <Button
            onClick={() => {
              setRole(choice);
              setOpen(false);
            }}
          >
            Save role
          </Button>
        }
      >
        <RadioGroup variant="rows" label="Role" value={choice} onValueChange={setChoice}>
          <Radio value="member" label="Member" detail="Works on the projects they’re added to." />
          <Radio value="admin" label="Admin" detail="Also manages members and billing." />
        </RadioGroup>
      </Dialog>
    </Stack>
  );
}
