import { Button, Column, Tabs, Text } from '@envsemble/envui';
import { IconLock } from '@envsemble/envui/icons/Lock';
import { IconNotifications } from '@envsemble/envui/icons/Notifications';
import { IconPerson } from '@envsemble/envui/icons/Person';

const sections = [
  { value: 'profile', label: 'Profile', icon: IconPerson, text: 'Alex Morgan, alex@example.com' },
  { value: 'notifications', label: 'Notifications', icon: IconNotifications, text: 'E-mail daily' },
  { value: 'security', label: 'Security', icon: IconLock, text: 'Two-step sign-in is on.' },
];

export default function VerticalList() {
  return (
    <Tabs
      aria-label="Account settings"
      orientation="vertical"
      // Tabs puts its list above the panels; a row puts the vertical list beside them.
      style={{ flexDirection: 'row', alignItems: 'start' }}
      items={sections.map((section) => ({
        value: section.value,
        button: (
          <Button variant="ghost" startIcon={<section.icon />}>
            {section.label}
          </Button>
        ),
        content: (
          <Column gap={2}>
            <Text render={<h3 />} variant="title">
              {section.label}
            </Text>
            <Text>{section.text}</Text>
          </Column>
        ),
      }))}
    />
  );
}
