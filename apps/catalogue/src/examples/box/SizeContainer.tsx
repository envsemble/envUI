import { Box, Column, Grid, Text } from '@envsemble/envui';

const figures = [
  ['Open tasks', '24'],
  ['Done this week', '9'],
  ['Overdue', '2'],
];

export default function SizeContainer() {
  return (
    // A container the application's own style sheet can query, such as
    // @container summary (width >= 37.5rem) { … }; the box is as wide as its context gives it.
    <Box container="summary">
      <Grid columns="repeat(auto-fit, minmax(min(100%, 9rem), 1fr))" gap={4}>
        {figures.map(([label, value]) => (
          <Column key={label} gap={1}>
            <Text variant="body-sm" emphasis="muted">
              {label}
            </Text>
            <Text variant="headline">{value}</Text>
          </Column>
        ))}
      </Grid>
    </Box>
  );
}
