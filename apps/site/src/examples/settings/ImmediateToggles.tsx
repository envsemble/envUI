import { useId, useState } from 'react';
import { List, Column, Switch, Text, Toast, useToast } from '@envsemble/envui';

interface Setting {
  id: string;
  title: string;
  detail: string;
}

/** A section of settings that each apply as they are switched: no Save button. */
function SettingsSection({
  title,
  settings,
  values,
  onChange,
}: {
  title: string;
  settings: readonly Setting[];
  values: Record<string, boolean>;
  onChange: (id: string, on: boolean) => void;
}) {
  const id = useId();
  return (
    <Column render={<section aria-labelledby={`${id}-heading`} />} gap={3}>
      <Text render={<h3 id={`${id}-heading`} />} variant="title">
        {title}
      </Text>
      <List.Root aria-labelledby={`${id}-heading`}>
        {settings.map((setting) => (
          <List.Item
            key={setting.id}
            label={<span id={`${id}-${setting.id}-title`}>{setting.title}</span>}
            description={<span id={`${id}-${setting.id}-detail`}>{setting.detail}</span>}
            action={
              // The row's title names the switch, and its detail describes it.
              <Switch
                aria-labelledby={`${id}-${setting.id}-title`}
                aria-describedby={`${id}-${setting.id}-detail`}
                checked={values[setting.id]}
                onCheckedChange={(on) => onChange(setting.id, on)}
              />
            }
          />
        ))}
      </List.Root>
    </Column>
  );
}

function NotificationSettings() {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, boolean>>({
    comments: true,
    mentions: true,
    summary: true,
    directory: false,
  });
  const change = (id: string, on: boolean) => {
    // The change is saved as it is made; a request to the server would go here.
    setValues((current) => ({ ...current, [id]: on }));
    // Only a change that shows somewhere else gets a notification; the switch itself says the rest.
    if (id === 'directory')
      toast.show({
        message: on
          ? 'Other people at Northwind can now find you in the directory.'
          : 'Only your teams can now find you in the directory.',
      });
  };
  return (
    <Column gap={6}>
      <SettingsSection
        title="Email notifications"
        settings={notifications}
        values={values}
        onChange={change}
      />
      <SettingsSection title="Privacy" settings={privacy} values={values} onChange={change} />
    </Column>
  );
}

export default function ImmediateToggles() {
  // An application has one Toast.Provider at its root; the example brings its own.
  return (
    <Toast.Provider>
      <NotificationSettings />
    </Toast.Provider>
  );
}

const notifications: readonly Setting[] = [
  { id: 'comments', title: 'Comments', detail: 'When someone comments on your documents.' },
  {
    id: 'mentions',
    title: 'Mentions',
    detail: 'When someone mentions you in a task or a comment.',
  },
  { id: 'summary', title: 'Weekly summary', detail: 'Your projects’ progress, every Monday.' },
];

const privacy: readonly Setting[] = [
  {
    id: 'directory',
    title: 'Show me in the directory',
    detail: 'Everyone at Northwind can find your name, team and email address.',
  },
];
