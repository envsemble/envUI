import { Rail, type Destination } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Label } from '@envsemble/envui/icons/Label';
import { Send } from '@envsemble/envui/icons/Send';
import { Star } from '@envsemble/envui/icons/Star';

// The same array a Drawer takes: the rail shows grouped destinations in order, without headings.
const destinations: Destination[] = [
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 12, current: true },
  { label: 'Sent', icon: <Send />, href: '/sent' },
  { label: 'Starred', icon: <Star />, href: '/starred', group: 'Folders' },
  { label: 'Labels', icon: <Label />, href: '/labels', group: 'Folders' },
  { label: 'Archive', icon: <Archive />, href: '/archive', group: 'Folders' },
];

export default function GroupsInOrder() {
  return <Rail aria-label="Mail" destinations={destinations} />;
}
