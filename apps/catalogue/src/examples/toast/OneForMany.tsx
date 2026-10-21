import { useEffect } from 'react';
import { Button, Toast, useToast, type ToastNotification } from '@envsemble/envui';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];
const sent: ToastNotification = { tone: 'success', message: `${people.length} invitations sent.` };

function InviteButton() {
  const toast = useToast();
  // Shown at once in the docs, as after a press, and kept until it is dismissed; without this
  // effect, the button shows it.
  useEffect(() => {
    const id = toast.show({ ...sent, duration: Infinity });
    return () => toast.dismiss(id);
  }, [toast]);
  return <Button onClick={() => toast.show(sent)}>Invite 3 people</Button>;
}

export default function OneForMany() {
  return (
    <Toast.Provider>
      <InviteButton />
    </Toast.Provider>
  );
}
