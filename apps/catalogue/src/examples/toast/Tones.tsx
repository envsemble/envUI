import { Button, Toast, useToast, type ToastNotification, Stack } from '@envsemble/envui';

const notifications: ToastNotification[] = [
  { tone: 'neutral', message: 'Files archived.' },
  { tone: 'success', message: 'Invitation sent to Sam Lee.' },
  { tone: 'info', message: 'A new version of this page is available.' },
  {
    tone: 'danger',
    message:
      'Changes couldn’t be saved. All seats are assigned; remove an assignment and try again.',
  },
];

function ToneButtons() {
  const toast = useToast();
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      {notifications.map((notification) => (
        <Button
          key={notification.tone}
          variant="secondary"
          onClick={() => toast.show(notification)}
        >
          Show {notification.tone}
        </Button>
      ))}
    </Stack>
  );
}

export default function Tones() {
  return (
    <Toast.Provider>
      <ToneButtons />
    </Toast.Provider>
  );
}
