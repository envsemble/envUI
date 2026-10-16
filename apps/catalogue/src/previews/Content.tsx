import { useState } from 'react';
import { Text, InfoChip, ActionGroup, Button, Rating, RelativeTime, Stack } from '@envsemble/envui';
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

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

export function RatingPreview() {
  return (
    <Preview>
      <Example title="Ratings" size="collection">
        <SpecimenGrid size="compact">
          <Specimen title="Whole stars">
            <Rating value={4} showValue />
          </Specimen>
          <Specimen title="Half a star">
            <Rating value={3.5} showValue />
          </Specimen>
          <Specimen title="Ten stars">
            <Rating value={7} max={10} />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

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
