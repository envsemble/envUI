import { useState } from 'react';
import { Column, Link, List, Panes, Surface, Text } from '@envsemble/envui';

const messages = [
  { id: 'budget', from: 'Sam Lee', subject: 'Budget review', body: 'Numbers are in the sheet.' },
  { id: 'launch', from: 'Priya Shah', subject: 'Launch checklist', body: 'The venue is booked.' },
];

export default function ListDetailByWidth() {
  const [chosen, setChosen] = useState(messages[0]!);
  const [open, setOpen] = useState(false);
  return (
    // Side by side from 52.5 rem; narrower, one pane at a time: a message opens over the list,
    // with a back button to it. Each pane holds a surface, as where a divider sits between them.
    <Panes.Root
      behavior="list-detail"
      open={open}
      onOpenChange={setOpen}
      backLabel="Team inbox"
      style={{ blockSize: '16rem' }}
    >
      <Panes.List label="Team inbox">
        <Surface padding={2} style={{ minBlockSize: '100%' }}>
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
        </Surface>
      </Panes.List>
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
