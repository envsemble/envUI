import { useState } from 'react';
import { Button, HoverCard, Link, Text, Theme, type ColorScheme } from '@envsemble/envui';

export const themes = true;

export default function HoverCardFixture({ theme }: { theme: ColorScheme }) {
  const [changes, setChanges] = useState<string[]>([]);
  return (
    <Theme theme={theme} data-testid={`hover-card-${theme}`} className="fixture-section">
      <div className="fixture-actions">
        <Button variant="secondary">Before {theme}</Button>
        <HoverCard
          trigger={<Link href="#roadmap">Roadmap {theme}</Link>}
          onOpenChange={(open) => setChanges((current) => [...current, String(open)])}
        >
          <Text>Changed today by Alex. 3 open decisions, 1 blocked.</Text>
        </HoverCard>
      </div>
      <output data-testid={`hover-card-changes-${theme}`}>{changes.join(' ')}</output>
    </Theme>
  );
}
