import { Column, Grid, Surface, Text } from '@envsemble/envui';

const figures = [
  ['Active projects', '128'],
  ['Tasks done', '1,284'],
  ['Lead time', '2.5 days'],
];

export default function GroupColumns() {
  return (
    // As many even columns as fit, each at least 11 rem wide, and one column below that.
    <Surface
      role="group"
      aria-label="Project health"
      render={
        <Grid
          name="key-figures"
          columns="repeat(auto-fit, minmax(min(100%, 11rem), 1fr))"
          gap={5}
        />
      }
    >
      {figures.map(([label, value]) => (
        <Column key={label} gap={1}>
          <Text variant="body-sm" emphasis="muted">
            {label}
          </Text>
          <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Text>
        </Column>
      ))}
    </Surface>
  );
}
