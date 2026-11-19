import { Breadcrumbs, DatePicker, TableOfContents } from '@envsemble/envui';

export const mount = 'standalone';

export default function TouchTargetsFixture() {
  return (
    <div style={{ padding: '2rem', display: 'grid', gap: '3rem' }}>
      <Breadcrumbs
        aria-label="Trail"
        items={[
          { label: 'Workspace', href: '#workspace' },
          { label: 'Plans', href: '#plans' },
          { label: 'Research' },
        ]}
      />
      <TableOfContents
        aria-label="On this page"
        items={[
          { id: 'before', label: 'Before you start' },
          { id: 'create', label: 'Create a workspace' },
          { id: 'invite', label: 'Invite your team' },
        ]}
      />
      <DatePicker label="Due" clearable defaultValue="2026-11-20" />
      {['before', 'create', 'invite'].map((id) => (
        <h2 key={id} id={id}>
          {id}
        </h2>
      ))}
    </div>
  );
}
