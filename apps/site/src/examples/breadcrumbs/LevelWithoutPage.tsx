import { Breadcrumbs } from '@envsemble/envui';

export default function LevelWithoutPage() {
  return (
    <Breadcrumbs
      aria-label="Budget location"
      items={[
        { label: 'Northwind', href: '/northwind' },
        { label: 'Archive' },
        { label: '2025 launch', href: '/northwind/archive/2025-launch' },
        { label: 'Budget' },
      ]}
    />
  );
}
