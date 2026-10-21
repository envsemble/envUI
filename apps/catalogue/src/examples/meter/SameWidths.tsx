import { Grid, Meter } from '@envsemble/envui';

export default function SameWidths() {
  return (
    // One width for meters people compare, so their bars compare too.
    <Grid columns={2} gap={5} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Meter label="Projects" value={12} max={50} valueText="12 of 50" />
      <Meter label="Seats" value={4} max={5} valueText="4 of 5" />
    </Grid>
  );
}
