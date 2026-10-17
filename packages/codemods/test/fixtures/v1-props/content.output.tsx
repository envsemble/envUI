import {
  Avatar,
  AvatarButton,
  AvatarGroup,
  Badge,
  Card,
  SegmentedControl,
  Stat,
} from '@envsemble/envui';

const people = [{ name: 'Alex Morgan' }];
const views = [{ value: 'open', label: 'Open' }];

export const Content = ({ size }: { size: 'small' | 'large' }) => (
  <>
    <Avatar name="Alex Morgan" size="sm" />
    <Avatar name="Sam Lee" />
    <Avatar name="Priya Shah" size="xl" />
    <AvatarGroup people={people} size="lg" />
    <AvatarButton name="Alex Morgan" size="sm" description="alex@example.com" />
    <Badge>Draft</Badge>
    <Card background="default" actions={<span />}>
      Summary
    </Card>
    <Card>Plain</Card>
    <Card>No actions yet</Card>
    <Stat.Root label="Projects" value="128" description="Last 30 days" />
    <Stat.Group background="muted" />
    <SegmentedControl aria-label="Views" items={views} value="open" onValueChange={() => {}} />
    <Avatar name="Jordan Ellis" size={size} />
  </>
);
