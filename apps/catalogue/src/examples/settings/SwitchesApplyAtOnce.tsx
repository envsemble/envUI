import { useState } from 'react';
import { Column, List, Switch, Text } from '@envsemble/envui';

export default function SwitchesApplyAtOnce() {
  const [on, setOn] = useState({ comments: true, summary: false });
  return (
    // Each switch applies the moment it changes: the section has no Save button.
    <Column
      render={<section aria-labelledby="immediate-heading" />}
      gap={3}
      style={{ inlineSize: 'min(100%, 22rem)' }}
    >
      <Text render={<h3 id="immediate-heading" />} variant="title">
        Mobile notifications
      </Text>
      <List.Root aria-labelledby="immediate-heading">
        <List.Item
          label="Comments"
          action={
            <Switch
              aria-label="Comments"
              checked={on.comments}
              onCheckedChange={(comments) => setOn({ ...on, comments })}
            />
          }
        />
        <List.Item
          label="Weekly summary"
          action={
            <Switch
              aria-label="Weekly summary"
              checked={on.summary}
              onCheckedChange={(summary) => setOn({ ...on, summary })}
            />
          }
        />
      </List.Root>
    </Column>
  );
}
