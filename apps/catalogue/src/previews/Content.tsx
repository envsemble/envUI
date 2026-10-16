import { ActionGroup, InfoChip } from '@envsemble/envui';
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
