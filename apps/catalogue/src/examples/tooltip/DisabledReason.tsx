import { Button, Column, Text, Tooltip } from '@envsemble/envui';
import { PersonAdd } from '@envsemble/envui/icons/PersonAdd';

export default function DisabledReason() {
  return (
    <Column gap={2} align="start">
      <Tooltip content="All seats are assigned. Remove a member to invite someone else.">
        <Button disabled startIcon={<PersonAdd />}>
          Invite member
        </Button>
      </Tooltip>
      {/* The tooltip isn't read by assistive technology, so the page says it too. */}
      <Text variant="body-sm">5 of 5 seats assigned</Text>
    </Column>
  );
}
