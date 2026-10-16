import { useId, useState } from 'react';
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
  const id = useId();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    comments: true,
    assignments: true,
    reminders: false,
  });
  return (
    <List.Root aria-label="E-mail notifications">
      {settings.map((setting) => (
        <List.Item
          key={setting.id}
          title={<span id={`${id}-${setting.id}-title`}>{setting.title}</span>}
          detail={<span id={`${id}-${setting.id}-detail`}>{setting.detail}</span>}
          action={
            // The row's title names the switch, and its detail describes it.
            <Switch
              aria-labelledby={`${id}-${setting.id}-title`}
              aria-describedby={`${id}-${setting.id}-detail`}
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
