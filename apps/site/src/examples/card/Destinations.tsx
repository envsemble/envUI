import { Card, Grid, Text } from '@envsemble/envui';

const projects = [
  { id: 'northwind', name: 'Northwind launch', summary: '12 open tasks · Due 14 November' },
  { id: 'pricing', name: 'Pricing research', summary: '4 open tasks · No due date' },
  { id: 'handbook', name: 'Support handbook', summary: 'Archived in March' },
];

export default function Destinations() {
  return (
    // As many columns of at least 14 rem as fit.
    <Grid columns={{ min: '14rem' }} gap={4} style={{ inlineSize: '100%' }}>
      {projects.map(({ id, name, summary }) => (
        // The card's text names the link: its title, then its summary.
        <Card key={id} href={`/projects/${id}`}>
          <Text render={<span />} variant="title">
            {name}
          </Text>
          <Text render={<span />} emphasis="muted">
            {summary}
          </Text>
        </Card>
      ))}
    </Grid>
  );
}
