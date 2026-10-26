import { Avatar, Drawer, Row, Text, type Destination } from '@envsemble/envui';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Label } from '@envsemble/envui/icons/Label';
import { Star } from '@envsemble/envui/icons/Star';

const destinations: Destination[] = [
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 12, current: true },
  { label: 'Starred', icon: <Star />, href: '/starred', group: 'Folders' },
  { label: 'Labels', icon: <Label />, href: '/labels', group: 'Folders' },
];

export default function DrawerAnatomy() {
  return (
    <Drawer
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
