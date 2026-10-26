import { Card, Grid } from '@envsemble/envui';

const projects = ['Website refresh', 'Quarterly report', 'Onboarding guide'];

export default function FixedColumns() {
  return (
    // Three columns at any width: in a narrow pane, each card is squeezed.
    <Grid columns={3} gap={4} style={{ inlineSize: '100%' }}>
      {projects.map((name) => (
        <Card key={name} title={name} meta="Sam Lee" />
      ))}
    </Grid>
  );
}
