import { Badge, Breadcrumbs, Grid, IconButton, Surface } from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

export default function OneLine() {
  return (
    // A header bar in a narrow pane: the trail takes the room the status and the action leave.
    <Surface
      background="muted"
      padding={2}
      radius="sm"
      style={{ inlineSize: 'min(100%, 28rem)' }}
      render={<Grid columns="minmax(0, 1fr) auto auto" align="center" gap={2} />}
    >
      <Breadcrumbs
        aria-label="Document location"
        wrap={false}
        items={[
          { label: 'Plans', href: '/plans' },
          { label: 'Design', href: '/plans/design' },
          { label: 'Quarterly review of the shared design tokens' },
        ]}
      />
      <Badge tone="success">Published</Badge>
      <IconButton variant="text" size="sm" icon={<MoreVert />} aria-label="More actions" />
    </Surface>
  );
}
