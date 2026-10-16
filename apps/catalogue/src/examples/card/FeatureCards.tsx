import { Button, FeatureCard, Stack } from '@envsemble/envui';
import { Groups } from '@envsemble/envui/icons/Groups';
import { UploadFile } from '@envsemble/envui/icons/UploadFile';

export default function FeatureCards() {
  return (
    <Stack gap={3}>
      <FeatureCard
        icon={<Groups />}
        title="Invite your team"
        description="Plans, comments and files stay in one shared workspace."
        action={<Button>Invite people</Button>}
      />
      {/* In a card narrower than 38 rem, the action moves below the text and fills the card. */}
      <FeatureCard
        icon={<UploadFile />}
        title="Import your plans"
        description="Bring in spreadsheets and documents from another tool."
        action={<Button variant="secondary">Import</Button>}
        style={{ inlineSize: 'min(100%, 24rem)' }}
      />
    </Stack>
  );
}
