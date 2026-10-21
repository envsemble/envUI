import { Card, Grid, placeholders } from '@envsemble/envui';

interface Member {
  id: string;
  name: string;
  role: string;
}

export default function CardLoading({ members }: { members?: Member[] }) {
  // Until the members arrive, the same cards are skeletons over placeholder items.
  return (
    <Grid columns={2} gap={4} style={{ inlineSize: '100%' }}>
      {(members ?? placeholders<Member>(2)).map((member) => (
        <Card key={member.id} skeleton={!members} title={member.name} description={member.role} />
      ))}
    </Grid>
  );
}
