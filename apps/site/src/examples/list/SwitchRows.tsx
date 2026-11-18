import { useState } from 'react';
import { List, Switch } from '@envsemble/envui';

const alerts = [
  { id: 'replies', title: 'Replies', detail: 'When someone answers a comment of yours.' },
  { id: 'mentions', title: 'Mentions', detail: 'When someone names you in a document.' },
  { id: 'digest', title: 'Weekly digest', detail: 'A summary of your projects on Mondays.' },
];

export default function SwitchRows() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    replies: true,
    mentions: true,
    digest: false,
  });
  return (
    <List.Root aria-label="Alerts" style={{ inlineSize: 'min(100%, 28rem)' }}>
      {alerts.map((alert) => (
        <List.Item
          key={alert.id}
          label={alert.title}
          description={alert.detail}
          control={
            <Switch
              checked={enabled[alert.id]}
              onCheckedChange={(checked) =>
                setEnabled((current) => ({ ...current, [alert.id]: checked }))
              }
            />
          }
        />
      ))}
    </List.Root>
  );
}
