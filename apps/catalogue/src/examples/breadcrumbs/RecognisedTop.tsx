import { Breadcrumbs } from '@envsemble/envui';

export default function RecognisedTop() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Plans', href: '/workspace/plans' },
        { label: 'Interview notes' },
      ]}
    />
  );
}
