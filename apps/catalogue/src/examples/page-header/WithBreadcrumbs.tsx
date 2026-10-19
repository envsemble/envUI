import { Badge, Breadcrumbs, Button, PageHeader } from '@envsemble/envui';
import { Share } from '@envsemble/envui/icons/Share';

export default function WithBreadcrumbs() {
  return (
    // Level 2 under this page's own heading; a page's own header keeps the default, 1.
    <PageHeader
      headingLevel={2}
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
          <Button variant="secondary" startIcon={<Share />}>
            Share
          </Button>
          <Button>New task</Button>
        </>
      }
    />
  );
}
