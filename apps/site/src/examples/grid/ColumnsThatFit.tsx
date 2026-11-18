import { Column, Grid, Text } from '@envsemble/envui';

const figures = [
  { label: 'Open tasks', value: '128' },
  { label: 'Done this week', value: '42' },
  { label: 'Overdue', value: '7' },
  { label: 'Members', value: '16' },
];

export default function ColumnsThatFit() {
  return (
    <Grid columns={{ min: '9rem' }} gap={5} render={<dl />}>
      {figures.map(({ label, value }) => (
        <Column key={label} gap={1}>
          <Text render={<dt />} variant="caption" emphasis="muted">
            {label}
          </Text>
          <Text render={<dd />} variant="headline" style={{ margin: 0 }}>
            {value}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}
