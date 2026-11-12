import { useState } from 'react';
import { Column, Switch } from '@envsemble/envui';

export default function NotificationSettings() {
  const [mentions, setMentions] = useState(true);
  const [summary, setSummary] = useState(false);
  return (
    <Column gap={3} align="start">
      <Switch
        label="E-mail me when someone mentions me"
        checked={mentions}
        onCheckedChange={setMentions}
      />
      <Switch label="Send me a weekly summary" checked={summary} onCheckedChange={setSummary} />
    </Column>
  );
}
