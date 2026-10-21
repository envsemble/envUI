import { Button, Card } from '@envsemble/envui';
import { Groups } from '@envsemble/envui/icons/Groups';

export default function InviteFeature() {
  return (
    <Card
      layout="feature"
      icon={<Groups />}
      title="Invite your team"
      description="Plans, comments and files stay in one shared workspace."
      actions={<Button>Invite people</Button>}
    />
  );
}
