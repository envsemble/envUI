import { Avatar, NavigationDrawer, Row, Text, type Destination } from '@envsemble/envui';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconLabel } from '@envsemble/envui/icons/Label';
import { IconStar } from '@envsemble/envui/icons/Star';

const destinations: Destination[] = [
  { label: 'Inbox', icon: <IconInbox />, href: '/inbox', count: 12, current: true },
  { label: 'Starred', icon: <IconStar />, href: '/starred', group: 'Folders' },
  { label: 'Labels', icon: <IconLabel />, href: '/labels', group: 'Folders' },
];

export default function DrawerAnatomy() {
  return (
    <NavigationDrawer
      destinations={destinations}
      header={
        <Text variant="title" render={<span />}>
          Mail
        </Text>
      }
      footer={
        <Row align="center" gap={2}>
          <Avatar name="Alex Morgan" size="sm" />
          <Text render={<span />}>Alex Morgan</Text>
        </Row>
      }
    />
  );
}
