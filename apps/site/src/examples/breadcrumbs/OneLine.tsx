import { Badge, Breadcrumbs, Grid, IconButton } from '@envsemble/envui';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

export default function OneLine() {
  return (
    <Grid
      columns="minmax(0, 1fr) auto auto"
      align="center"
      gap={2}
      style={{ inlineSize: 'min(100%, 28rem)' }}
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
      <IconButton variant="text" size="sm" icon={<IconMoreVert />} aria-label="More actions" />
    </Grid>
  );
}
