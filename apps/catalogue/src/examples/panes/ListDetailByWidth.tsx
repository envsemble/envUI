import { useState } from 'react';
import { Column, Link, List, Panes, Text } from '@envsemble/envui';

const messages = [
  { id: 'launch', from: 'Priya Shah', subject: 'Launch checklist', body: 'The venue is booked.' },
  { id: 'budget', from: 'Sam Lee', subject: 'Budget review', body: 'Numbers are in the sheet.' },
];

export default function ListDetailByWidth() {
  const [chosen, setChosen] = useState(messages[0]!);
  const [open, setOpen] = useState(false);
  return (
    // Side by side from 52.5 rem; narrower, one pane at a time: a message opens over the list,
    // with a back button to it.
    <Panes.Root
      behavior="list-detail"
      open={open}
      onOpenChange={setOpen}
      backLabel="Inbox"
      style={{ blockSize: '16rem' }}
    >
      <Panes.List label="Inbox">
        <List.Root aria-label="Messages">
          {messages.map((message) => (
            <List.Item
              key={message.id}
              selected={message.id === chosen.id}
              label={
                <Link
                  href={`/inbox/${message.id}`}
                  underline={false}
                  data-row-target
                  aria-current={message.id === chosen.id || undefined}
                  onClick={() => {
                    setChosen(message);
                    setOpen(true);
                  }}
                >
                  {message.subject}
                </Link>
              }
              description={message.from}
            />
          ))}
        </List.Root>
      </Panes.List>
      <Panes.Detail label={chosen.subject}>
        <Column gap={2} padding={4}>
          <Text variant="title" render={<h3 />}>
            {chosen.subject}
          </Text>
          <Text>{chosen.body}</Text>
        </Column>
      </Panes.Detail>
    </Panes.Root>
  );
}
