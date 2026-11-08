import { useState } from 'react';
import { Button, HoverCard, Link, Text, Theme, type ColorScheme } from '@envsemble/envui';

export function HoverCardFixture({ theme }: { theme: ColorScheme }) {
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
        {/* Text that shows more takes the dotted underline; a button or Text holding only an icon
            doesn't. */}
        <HoverCard
          trigger={
            <Text render={<span />} tabIndex={0}>
              28 h {theme}
            </Text>
          }
        >
          <Text>Reviews 11 h, drafting 9 h, meetings 8 h.</Text>
        </HoverCard>
        <HoverCard trigger={<Button variant="secondary">Details {theme}</Button>}>
          <Text>Button details.</Text>
        </HoverCard>
      </div>
      <output data-testid={`hover-card-changes-${theme}`}>{changes.join(' ')}</output>
    </Theme>
  );
}
