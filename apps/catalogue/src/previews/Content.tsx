import { InfoChip, Stack } from '@envsemble/envui';
import { Example } from './Example';
import { Preview } from './Preview';

export function ChipsPreview() {
  return (
    <Preview>
      <Example title="Metadata" caption="Read-only metadata. Use a Button for actions.">
        <Stack direction="row" wrap align="center" gap={4}>
          <InfoChip>Optional</InfoChip>
          <InfoChip>Read only</InfoChip>
          <InfoChip>3 members</InfoChip>
        </Stack>
      </Example>
    </Preview>
  );
}
