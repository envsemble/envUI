import { Button, Card, FeatureCard } from '@envsemble/envui';
import { Groups } from '@envsemble/envui/icons/Groups';

export function Cards({ kind, start }: { kind: 'div' | 'article'; start: () => void }) {
  return (
    <>
      <FeatureCard
        icon={<Groups />}
        title="Invite your team"
        description="Plans and files in one place."
        action={<Button>Invite people</Button>}
      />
      <Card as={kind}>Chosen at run time</Card>
      <Card disabled>Copy a project</Card>
      <Card
        render={<article />}
        title="Pricing research"
        meta="Updated yesterday"
        actions={<Button>Open</Button>}>
        Interviews from twelve teams.
      </Card>
      <Card onClick={start}>
        Blank project
      </Card>
      <Card render={<article />} heading="Release notes">
        What changed this week.
      </Card>
      <Card render={<article />} title="Draft notes">Not shared yet.</Card>
    </>
  );
}
