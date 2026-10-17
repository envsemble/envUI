import { ActionCard, Button, Card, FeatureCard } from '@envsemble/envui';
import { Groups } from '@envsemble/envui/icons/Groups';

export function Cards({ kind, start }: { kind: 'div' | 'article'; start: () => void }) {
  return (
    <>
      <Card as={kind}>Chosen at run time</Card>
      <ActionCard title="Pricing research" meta="Updated yesterday" actions={<Button>Open</Button>}>
        Interviews from twelve teams.
      </ActionCard>
      <FeatureCard
        icon={<Groups />}
        title="Invite your team"
        description="Plans and files in one place."
        action={<Button>Invite people</Button>}
      />
      <Card as="button" onClick={start}>
        Blank project
      </Card>
      <Card as="article" heading="Release notes">
        What changed this week.
      </Card>
    </>
  );
}
