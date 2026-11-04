import { Card, Grid } from '@envsemble/envui';

const projects = ['Website refresh', 'Quarterly report', 'Onboarding guide'];

export default function FittingColumns() {
  return (
    // As many columns as fit at 12 rem in the pane it fills: one in a narrow pane.
    <Grid columns={{ min: '12rem' }} gap={4} style={{ inlineSize: '100%' }}>
      {projects.map((name) => (
        <Card key={name} title={name} meta="Sam Lee" />
      ))}
    </Grid>
  );
}
