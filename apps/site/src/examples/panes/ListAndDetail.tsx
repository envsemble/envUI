import { useState } from 'react';
import { Button, Column, List, Panes, Surface, Text } from '@envsemble/envui';

const messages = [
  { id: 'launch', from: 'Priya Shah', subject: 'Launch checklist', body: 'The venue is booked.' },
  { id: 'budget', from: 'Sam Lee', subject: 'Budget review', body: 'Numbers are in the sheet.' },
  { id: 'hiring', from: 'Alex Morgan', subject: 'Hiring plan', body: 'Two roles open in May.' },
];

export default function ListAndDetail() {
  const [chosen, setChosen] = useState(messages[0]!);
  return (
    <Panes.Root
      defaultWidth={16}
      minWidth={12}
      maxWidth={24}
      style={{
        inlineSize: 'min(100%, 40rem)',
        blockSize: '18rem',
        '--env-panes-other-min': 'min(16rem, 50cqi)',
      }}
    >
      <Panes.Pane label="Inbox">
        <Surface radius="none" padding={2} style={{ minBlockSize: '100%' }}>
          <List.Root aria-label="Messages">
            {messages.map((message) => (
              <List.Item
                key={message.id}
                interactive
                current={message.id === chosen.id}
                label={
                  <Button variant="text" data-row-target onClick={() => setChosen(message)}>
                    {message.subject}
                  </Button>
                }
                description={message.from}
              />
            ))}
          </List.Root>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize the inbox" />
      <Panes.Pane label={chosen.subject}>
        <Surface
          radius="none"
          padding={4}
          background="page"
          render={<Column gap={2} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            {chosen.subject}
          </Text>
          <Text>{chosen.body}</Text>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
