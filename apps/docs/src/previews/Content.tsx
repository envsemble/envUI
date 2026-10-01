import { useState } from 'react';
import { Text, InfoChip, DisclosureNote, ActionGroup } from '@envsemble/envui';
import { Example } from './Example';
import { PairedThemes } from './PairedThemes';

export function ChipsPreview() {
  return (
    <PairedThemes>
      {() => (
        <Example title="Metadata">
          <ActionGroup>
            <InfoChip>Optional</InfoChip>
            <InfoChip>Read only</InfoChip>
            <InfoChip>3 members</InfoChip>
          </ActionGroup>
        </Example>
      )}
    </PairedThemes>
  );
}

export function DisclosuresPreview() {
  const [guidanceExpanded, setGuidanceExpanded] = useState(false);
  return (
    <PairedThemes>
      {() => (
        <Example title="Optional guidance">
          <DisclosureNote
            title="How visibility works"
            open={guidanceExpanded}
            onToggle={(e) => setGuidanceExpanded(e.currentTarget.open)}
          >
            <Text>
              Team projects are available to every workspace member. Private projects are visible
              only to invited people.
            </Text>
          </DisclosureNote>
        </Example>
      )}
    </PairedThemes>
  );
}
