import { Breadcrumbs } from '@envsemble/envui';

export default function RecognisedTop() {
  return (
    <Breadcrumbs
      aria-label="Breadcrumb, from the workspace"
      items={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Plans', href: '/workspace/plans' },
        { label: 'Interview notes' },
      ]}
    />
  );
}
