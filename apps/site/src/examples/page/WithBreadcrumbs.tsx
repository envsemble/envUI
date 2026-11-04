import { Badge, Breadcrumbs, Button, PageHeader } from '@envsemble/envui';
import { IconShare } from '@envsemble/envui/icons/Share';

export default function WithBreadcrumbs() {
  return (
    // Level 3 inside these docs; a page's own header keeps the default, 1.
    <PageHeader
      headingLevel={3}
      title="Northwind launch"
      description="Press kit, venue and invitations for the spring launch."
      breadcrumbs={
        <Breadcrumbs
          wrap={false}
          items={[
            { label: 'Workspace', href: '/workspace' },
            { label: 'Projects', href: '/projects' },
            { label: 'Northwind launch' },
          ]}
        />
      }
      meta={<Badge tone="success">On track</Badge>}
      actions={
        <>
          <Button variant="secondary" startIcon={<IconShare />}>
            Share
          </Button>
          <Button>New task</Button>
        </>
      }
    />
  );
}
