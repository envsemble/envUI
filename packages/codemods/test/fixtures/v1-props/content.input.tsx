import {
  Avatar,
  AvatarButton,
  AvatarGroup,
  Badge,
  Card,
  SegmentedControl,
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
    <Card layout="stack" title="Stacked" />
    <Card layout="feature" icon={<span />} title="Invite your team" />
    <SegmentedControl aria-label="Views" options={views} value="open" onValueChange={() => {}} />
    <Avatar name="Jordan Ellis" size={size} />
    <Avatar name="Mia Chen" hue="teal" />
    <Avatar name="Noah Park" hue="blue" />
  </>
);
