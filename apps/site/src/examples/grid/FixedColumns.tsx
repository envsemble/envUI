import { Card, Grid } from '@envsemble/envui';

const projects = ['Website refresh', 'Quarterly report', 'Onboarding guide'];

export default function FixedColumns() {
  return (
    // A narrow pane: three columns at any width squeeze each card.
    <Grid columns={3} gap={4} style={{ inlineSize: '18rem' }}>
      {projects.map((name) => (
        <Card key={name} title={name} meta="Sam Lee" />
      ))}
    </Grid>
  );
}
