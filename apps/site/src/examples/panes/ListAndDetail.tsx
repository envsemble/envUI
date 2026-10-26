import { useState } from 'react';
import { Column, Link, List, Panes, Surface, Text } from '@envsemble/envui';

const messages = [
  { id: 'launch', from: 'Priya Shah', subject: 'Launch checklist', body: 'The venue is booked.' },
  { id: 'budget', from: 'Sam Lee', subject: 'Budget review', body: 'Numbers are in the sheet.' },
  { id: 'hiring', from: 'Alex Morgan', subject: 'Hiring plan', body: 'Two roles open in May.' },
];

export default function ListAndDetail() {
  const [chosen, setChosen] = useState(messages[0]);
  const [open, setOpen] = useState(false);
  return (
    // Side by side from an expanded width of their own; narrower, one at a time, the message
    // with a back button to the list. Each pane holds a surface, so the divider is the gap
    // between two surfaces.
    <Panes.Root
      behavior="list-detail"
      open={open}
      onOpenChange={setOpen}
      backLabel="Inbox"
      style={{ blockSize: '18rem' }}
    >
      <Panes.List label="Inbox">
        <Surface padding={2} style={{ minBlockSize: '100%' }}>
          <List.Root aria-label="Messages">
            {messages.map((message) => (
              <List.Item
                key={message.id}
                selected={message.id === chosen.id}
                label={
                  // The row's target: the item that opens the message, where Back returns focus.
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
        </Surface>
      </Panes.List>
      <Panes.Divider label="Resize the inbox" />
      <Panes.Detail label={chosen.subject}>
        <Surface padding={4} render={<Column gap={2} />} style={{ minBlockSize: '100%' }}>
          <Text variant="title" render={<h3 />}>
            {chosen.subject}
          </Text>
          <Text>{chosen.body}</Text>
        </Surface>
      </Panes.Detail>
    </Panes.Root>
  );
}
