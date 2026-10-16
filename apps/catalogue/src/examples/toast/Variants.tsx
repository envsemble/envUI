import { ActionGroup, Button, Toast, useToast, type ToastNotification } from '@envsemble/envui';

const notifications: ToastNotification[] = [
  { variant: 'neutral', message: 'Files archived.' },
  { variant: 'success', message: 'Invitation sent to Sam Lee.' },
  { variant: 'info', message: 'A new version of this page is available.' },
  {
    variant: 'error',
    message:
      'Changes couldn’t be saved. All seats are assigned; remove an assignment and try again.',
  },
];

function VariantButtons() {
  const toast = useToast();
  return (
    <ActionGroup>
      {notifications.map((notification) => (
        <Button
          key={notification.variant}
          variant="secondary"
          onClick={() => toast.show(notification)}
        >
          Show {notification.variant}
        </Button>
      ))}
    </ActionGroup>
  );
}

export default function Variants() {
  return (
    <Toast.Provider>
      <VariantButtons />
    </Toast.Provider>
  );
}
