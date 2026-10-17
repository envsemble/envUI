import { Button, Card } from '@envsemble/envui';
import { Groups } from '@envsemble/envui/icons/Groups';

export function Cards({ kind, start }: { kind: 'div' | 'article'; start: () => void }) {
  return (
    <>
      <Card as={kind}>Chosen at run time</Card>
      <Card
        render={<article />}
        heading="Pricing research"
        meta="Updated yesterday"
        actions={<Button>Open</Button>}>
        Interviews from twelve teams.
      </Card>
      <Card
        layout="feature"
        headingLevel={2}
        icon={<Groups />}
        heading="Invite your team"
        description="Plans and files in one place."
        actions={<Button>Invite people</Button>} />
      <Card onClick={start}>
        Blank project
      </Card>
      <Card render={<article />} heading="Release notes">
        What changed this week.
      </Card>
    </>
  );
}
