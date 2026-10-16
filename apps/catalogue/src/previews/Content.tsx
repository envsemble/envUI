import { useState } from 'react';
import {
  Text,
  InfoChip,
  Disclosure,
  ActionGroup,
  AnimatedNumber,
  IconButton,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Remove } from '@envsemble/envui/icons/Remove';
import { Example } from './Example';
import { Preview } from './Preview';

export function ChipsPreview() {
  return (
    <Preview>
      <Example title="Metadata" caption="Read-only metadata. Use a Button for actions.">
        <ActionGroup>
          <InfoChip>Optional</InfoChip>
          <InfoChip>Read only</InfoChip>
          <InfoChip>3 members</InfoChip>
        </ActionGroup>
      </Example>
    </Preview>
  );
}

export function DisclosurePreview() {
  const [guidanceExpanded, setGuidanceExpanded] = useState(false);
  return (
    <Preview>
      <Example
        title="Optional guidance"
        caption="Keep required information and validation errors visible."
      >
        <Disclosure
          title="How visibility works"
          open={guidanceExpanded}
          onToggle={(e) => setGuidanceExpanded(e.currentTarget.open)}
        >
          <Text>
            Team projects are available to every workspace member. Private projects are visible only
            to invited people.
          </Text>
        </Disclosure>
      </Example>
    </Preview>
  );
}

export function AnimatedNumberPreview() {
  const [seats, setSeats] = useState(3);
  return (
    <Preview>
      <Example
        title="A changing count"
        caption="The number rolls up as it grows and down as it shrinks; with reduced motion it fades."
      >
        <ActionGroup>
          <IconButton
            icon={<Remove />}
            aria-label="One seat fewer"
            disabled={seats === 0}
            onClick={() => setSeats((count) => count - 1)}
          />
          <IconButton
            icon={<Add />}
            aria-label="One seat more"
            onClick={() => setSeats((count) => count + 1)}
          />
        </ActionGroup>
        <Text>
          <AnimatedNumber value={seats} /> {seats === 1 ? 'seat' : 'seats'} left after this change
        </Text>
      </Example>
    </Preview>
  );
}
