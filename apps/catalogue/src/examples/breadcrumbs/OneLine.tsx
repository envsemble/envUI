import { Badge, Breadcrumbs, IconButton, Surface } from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

/** A header bar in a narrow pane: the trail takes the room the status and the action leave. */
const bar = {
  inlineSize: 'min(100%, 28rem)',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  alignItems: 'center',
  gap: '0.5rem',
} as const;

export default function OneLine() {
  return (
    <Surface tone="row" padding={2} corners="standard" style={bar}>
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
