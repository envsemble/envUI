import { Button, Toast, useToast } from '@envsemble/envui';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];

function InviteButton() {
  const toast = useToast();
  // Wrong: one action, and a notification for each person it reached.
  const invite = () =>
    people.forEach((person) => toast.show({ tone: 'success', message: `Invited ${person}.` }));
  return <Button onClick={invite}>Invite 3 people</Button>;
}

export default function OnePerItem() {
  return (
    <Toast.Provider>
      <InviteButton />
    </Toast.Provider>
  );
}
