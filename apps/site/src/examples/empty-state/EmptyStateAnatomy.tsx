import { Button, EmptyState } from '@envsemble/envui';
import { IconInbox } from '@envsemble/envui/icons/Inbox';

export default function EmptyStateAnatomy() {
  return (
    <EmptyState
      icon={<IconInbox />}
      title="No invitations"
      description="Invitations to other workspaces show here."
      actions={<Button>Refresh</Button>}
      style={{ inlineSize: 'min(100%, 28rem)' }}
    />
  );
}
