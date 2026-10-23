import { IconButton, Tooltip } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

export default function LongTooltip() {
  return (
    <Tooltip
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      // Wrong: a paragraph people must hold the pointer still to read.
      content={
        'Refreshes the list of members from the server. Members who joined in the last few ' +
        'minutes may take a while to appear, and removed members disappear.'
      }
    >
      <IconButton icon={<Refresh />} aria-label="Refresh members" />
    </Tooltip>
  );
}
