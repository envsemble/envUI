import { Button, Card, Stack } from '@envsemble/envui';
import { Groups } from '@envsemble/envui/icons/Groups';
import { UploadFile } from '@envsemble/envui/icons/UploadFile';

export default function FeatureCards() {
  return (
    <Stack gap={3}>
      <Card
        layout="feature"
        icon={<Groups />}
        heading="Invite your team"
        description="Plans, comments and files stay in one shared workspace."
        actions={<Button>Invite people</Button>}
      />
      {/* In a card narrower than 38 rem, the action moves below the text and fills the card. */}
      <Card
        layout="feature"
        icon={<UploadFile />}
        heading="Import your plans"
        description="Bring in spreadsheets and documents from another tool."
        actions={<Button variant="secondary">Import</Button>}
        style={{ inlineSize: 'min(100%, 24rem)' }}
      />
    </Stack>
  );
}
