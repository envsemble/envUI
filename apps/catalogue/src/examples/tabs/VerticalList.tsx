import { NavList, Stack, Tabs, Text } from '@envsemble/envui';
import { Lock } from '@envsemble/envui/icons/Lock';
import { Notifications } from '@envsemble/envui/icons/Notifications';
import { Person } from '@envsemble/envui/icons/Person';

const sections = [
  { value: 'profile', label: 'Profile', icon: Person, text: 'Alex Morgan, alex@example.com' },
  { value: 'notifications', label: 'Notifications', icon: Notifications, text: 'E-mail daily' },
  { value: 'security', label: 'Security', icon: Lock, text: 'Two-step sign-in is on.' },
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
        button: <NavList.Item icon={<section.icon />}>{section.label}</NavList.Item>,
        content: (
          <Stack gap={2}>
            <Text as="h3" variant="section-heading">
              {section.label}
            </Text>
            <Text>{section.text}</Text>
          </Stack>
        ),
      }))}
    />
  );
}
