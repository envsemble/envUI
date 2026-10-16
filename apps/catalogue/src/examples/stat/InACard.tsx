import { Card, Stat } from '@envsemble/envui';

export default function InACard() {
  return (
    // A stat has no surface of its own; a card gives one figure its frame.
    <Card>
      <Stat.Root
        label="Open invoices"
        value="€12,800"
        trend={{ direction: 'down', label: '3 fewer than last month', tone: 'success' }}
        detail="Due within 30 days"
      />
    </Card>
  );
}
