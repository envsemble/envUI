import { useId } from 'react';
import { Stack, Stat, Surface, Text } from '@envsemble/envui';

export default function OnAPane() {
  const headingId = useId();
  return (
    <Surface tone="pane" padding={5} render={<Stack gap={4} />}>
      <Text as="h3" variant="section-heading" id={headingId}>
        Design review
      </Text>
      {/* On a pane, the row tone sets the group apart; the heading names it. */}
      <Stat.Group tone="row" padding={4} aria-labelledby={headingId}>
        <Stat.Root label="Comments" value="24" detail="From 6 people" />
        <Stat.Root label="Resolved" value="18" trend={{ direction: 'up', label: '+5 today' }} />
      </Stat.Group>
    </Surface>
  );
}
