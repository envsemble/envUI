import { Breadcrumbs } from '@envsemble/envui';

export default function LevelWithoutPage() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Northwind', href: '/northwind' },
        // Archived projects have no page of their own, so this level is plain text.
        { label: 'Archive' },
        { label: '2025 launch', href: '/northwind/archive/2025-launch' },
        { label: 'Budget' },
      ]}
    />
  );
}
