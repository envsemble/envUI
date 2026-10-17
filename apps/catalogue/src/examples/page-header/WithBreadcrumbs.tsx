import { Badge, Breadcrumbs, Button, PageHeader } from '@envsemble/envui';
import { Share } from '@envsemble/envui/icons/Share';

export default function WithBreadcrumbs() {
  return (
    <PageHeader
      title="Northwind launch"
      description="Press kit, venue and invitations for the spring launch."
      breadcrumbs={
        <Breadcrumbs
          wrap={false}
          items={[
            { label: 'Workspace', href: '#workspace' },
            { label: 'Projects', href: '#projects' },
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
