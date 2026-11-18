import { useEffect } from 'react';
import { Button, ToastProvider, useToast, type ToastNotification } from '@envsemble/envui';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];
const sent: ToastNotification = { tone: 'success', message: `${people.length} invitations sent.` };

function InviteButton() {
  const toast = useToast();
  useEffect(
    function showAsIfPressed() {
      const id = toast.show({ ...sent, duration: Infinity });
      return () => toast.dismiss(id);
    },
    [toast],
  );
  return <Button onClick={() => toast.show(sent)}>Invite 3 people</Button>;
}

export default function OneForMany() {
  return (
    <ToastProvider>
      <InviteButton />
    </ToastProvider>
  );
}
