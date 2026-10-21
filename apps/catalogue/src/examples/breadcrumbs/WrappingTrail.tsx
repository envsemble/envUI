import { Breadcrumbs } from '@envsemble/envui';

export default function WrappingTrail() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Plans', href: '/workspace/plans' },
        { label: 'Research', href: '/workspace/plans/research' },
        { label: 'Interview notes' },
      ]}
    />
  );
}
