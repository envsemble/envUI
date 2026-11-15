import { useState } from 'react';
import { List, Switch } from '@envsemble/envui';

const settings = [
  {
    id: 'comments',
    title: 'Comments',
    detail: 'When someone replies to you or comments on your documents.',
  },
  { id: 'assignments', title: 'Assignments', detail: 'When someone assigns a task to you.' },
  { id: 'reminders', title: 'Reminders', detail: 'A day before a task you own is due.' },
];

export default function SettingsRows() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    comments: true,
    assignments: true,
    reminders: false,
  });
  return (
    <List.Root title="E-mail notifications">
      {settings.map((setting) => (
        <List.Item
          key={setting.id}
          label={setting.title}
          description={setting.detail}
          control={
            <Switch
              checked={enabled[setting.id]}
              onCheckedChange={(checked) =>
                setEnabled((current) => ({ ...current, [setting.id]: checked }))
              }
            />
          }
        />
      ))}
    </List.Root>
  );
}
