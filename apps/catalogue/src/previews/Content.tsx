import { useState } from 'react';
import {
  Text,
  InfoChip,
  Disclosure,
  ActionGroup,
  AnimatedNumber,
  IconButton,
  Button,
  RelativeTime,
  Stack,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Remove } from '@envsemble/envui/icons/Remove';
import { Example, Specimen, SpecimenGrid } from './Example';
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

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

export function RelativeTimePreview() {
  // The moments are fixed when the page opens, so the texts move on with the clock.
  const [openedAt] = useState(() => Date.now());
  const [savedAt, setSavedAt] = useState(() => openedAt - 20 * minute);
  return (
    <Preview>
      <Example
        title="Past and coming moments"
        caption="Hover a time for the date and time. The texts keep up with the clock on their own."
      >
        <Stack gap={2}>
          <Text>
            Draft saved <RelativeTime value={savedAt} />
          </Text>
          <Text>
            Quarterly report updated <RelativeTime value={openedAt - 3 * hour} />
          </Text>
          <Text>
            Review due <RelativeTime value={openedAt + 2 * day} />
          </Text>
          <Text>
            Budget approved <RelativeTime value={openedAt - 5 * 7 * day} />
          </Text>
        </Stack>
        <ActionGroup>
          <Button variant="secondary" onClick={() => setSavedAt(Date.now())}>
            Save draft
          </Button>
        </ActionGroup>
      </Example>
      <Example title="Formats and languages" size="collection">
        <SpecimenGrid size="compact">
          <Specimen title="Long">
            <RelativeTime value={openedAt - 3 * hour} />
          </Specimen>
          <Specimen title="Short">
            <RelativeTime value={openedAt - 3 * hour} format="short" />
          </Specimen>
          <Specimen title="Narrow">
            <RelativeTime value={openedAt - 3 * hour} format="narrow" />
          </Specimen>
          <Specimen title="German">
            <RelativeTime value={openedAt + 2 * day} locale="de" />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
