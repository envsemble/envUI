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
    <Avatar name="Alex Morgan" size="small" />
    <Avatar name="Sam Lee" size="standard" />
    <Avatar name="Priya Shah" size="display" />
    <AvatarGroup people={people} size="large" />
    <AvatarButton name="Alex Morgan" size="small" detail="alex@example.com" />
    <Badge variant="subtle">Draft</Badge>
    <Card tone="pane" layout="action" actions={<span />}>
      Summary
    </Card>
    <Card tone="row">Plain</Card>
    <Card layout="action">No actions yet</Card>
    <Stat.Root label="Projects" value="128" detail="Last 30 days" />
    <Stat.Group tone="row" />
    <SegmentedControl aria-label="Views" options={views} value="open" onValueChange={() => {}} />
    <Avatar name="Jordan Ellis" size={size} />
  </>
);
