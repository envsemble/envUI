import { useRef } from 'react';
import { Button, Toast, useToast, Stack } from '@envsemble/envui';
import { Send } from '@envsemble/envui/icons/Send';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Rivera'];

function ReminderButton() {
  const toast = useToast();
  const next = useRef(0);
  const remind = () => {
    const person = people[next.current % people.length];
    next.current += 1;
    toast.show({ message: `Reminder sent to ${person}.`, duration: 8000 });
  };
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Button variant="secondary" startIcon={<Send />} onClick={remind}>
        Send reminder
      </Button>
    </Stack>
  );
}

export default function TopCenter() {
  return (
    <Toast.Provider defaultPlacement="top-center" visibleLimit={2}>
      <ReminderButton />
    </Toast.Provider>
  );
}
