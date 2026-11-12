import { useState } from 'react';
import { Button, Column, List, Switch, Text } from '@envsemble/envui';

export default function SwitchesWithSave() {
  const [on, setOn] = useState({ comments: true, summary: false });
  return (
    // Switches that wait for Save: people can't tell whether a change is kept.
    <Column
      render={<section aria-labelledby="saved-heading" />}
      gap={3}
      style={{ inlineSize: 'min(100%, 22rem)' }}
    >
      <Text render={<h3 id="saved-heading" />} variant="title">
        Desktop notifications
      </Text>
      <List.Root aria-labelledby="saved-heading">
        <List.Item
          label="Comments"
          end={
            <Switch
              aria-label="Comments"
              checked={on.comments}
              onCheckedChange={(comments) => setOn({ ...on, comments })}
            />
          }
        />
        <List.Item
          label="Weekly summary"
          end={
            <Switch
              aria-label="Weekly summary"
              checked={on.summary}
              onCheckedChange={(summary) => setOn({ ...on, summary })}
            />
          }
        />
      </List.Root>
      <Button variant="primary" style={{ alignSelf: 'start' }}>
        Save
      </Button>
    </Column>
  );
}
