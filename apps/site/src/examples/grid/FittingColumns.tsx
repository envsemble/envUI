import { Card, Grid } from '@envsemble/envui';

const projects = ['Website refresh', 'Quarterly report', 'Onboarding guide'];

export default function FittingColumns() {
  return (
    // A narrow pane: as many columns as fit at 12 rem, here one.
    <Grid columns={{ min: '12rem' }} gap={4} style={{ inlineSize: '18rem' }}>
      {projects.map((name) => (
        <Card key={name} title={name} meta="Sam Lee" />
      ))}
    </Grid>
  );
}
