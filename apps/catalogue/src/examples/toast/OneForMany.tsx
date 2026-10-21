import { Button, Toast, useToast } from '@envsemble/envui';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];

function InviteButton() {
  const toast = useToast();
  return (
    <Button
      onClick={() => toast.show({ tone: 'success', message: `${people.length} invitations sent.` })}
    >
      Invite 3 people
    </Button>
  );
}

export default function OneForMany() {
  return (
    <Toast.Provider>
      <InviteButton />
    </Toast.Provider>
  );
}
