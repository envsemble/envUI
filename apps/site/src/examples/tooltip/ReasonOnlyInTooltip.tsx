import { Button, Tooltip } from '@envsemble/envui';
import { PersonAdd } from '@envsemble/envui/icons/PersonAdd';

export default function ReasonOnlyInTooltip() {
  // Shown open in the docs; without defaultOpen, it opens on hover.
  return (
    // Wrong: touch screens never show the tooltip, so nothing says why.
    <Tooltip content="All seats are assigned. Remove a member to invite someone else." defaultOpen>
      <Button disabled startIcon={<PersonAdd />}>
        Invite member
      </Button>
    </Tooltip>
  );
}
