import { useRef } from 'react';
import { Button, Toast, useToast } from '@envsemble/envui';
import { Send } from '@envsemble/envui/icons/Send';

const people = [
  { name: 'Alex Morgan', email: 'alex.morgan@example.com' },
  { name: 'Sam Lee', email: 'sam.lee@example.com' },
  { name: 'Priya Shah', email: 'priya.shah@example.com' },
  { name: 'Jordan Rivera', email: null },
];

function ReminderButton() {
  const toast = useToast();
  const next = useRef(0);
  const remind = () => {
    const person = people[next.current % people.length]!;
    next.current += 1;
    // A reminder that couldn't go out is a danger notification, which always shows.
    toast.show(
      person.email
        ? { message: `Reminder sent to ${person.name}.` }
        : {
            tone: 'danger',
            message: `Reminder to ${person.name} couldn’t be sent: there’s no e-mail address.`,
          },
    );
  };
  return (
    <Button variant="secondary" startIcon={<Send />} onClick={remind}>
      Send reminder
    </Button>
  );
}

export default function TopCenter() {
  return (
    <Toast.Provider defaultPlacement="top-center" limit={2}>
      <ReminderButton />
    </Toast.Provider>
  );
}
