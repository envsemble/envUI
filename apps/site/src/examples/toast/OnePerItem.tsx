import { useEffect } from 'react';
import { Button, ToastProvider, useToast, type ToastNotification } from '@envsemble/envui';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];
// Wrong: one action, and a notification for each person it reached.
const invited = people.map(
  (person): ToastNotification => ({ tone: 'success', message: `Invited ${person}.` }),
);

function InviteButton() {
  const toast = useToast();
  // Shown at once in the docs, as after a press, and kept until they are dismissed; without this
  // effect, the button shows them.
  useEffect(() => {
    const ids = invited.map((notification) => toast.show({ ...notification, duration: Infinity }));
    return () => ids.forEach((id) => toast.dismiss(id));
  }, [toast]);
  const invite = () => invited.forEach((notification) => toast.show(notification));
  return <Button onClick={invite}>Invite 3 people</Button>;
}

export default function OnePerItem() {
  return (
    <ToastProvider>
      <InviteButton />
    </ToastProvider>
  );
}
