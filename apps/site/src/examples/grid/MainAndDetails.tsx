import { Column, DescriptionList, Grid, Text } from '@envsemble/envui';

export default function MainAndDetails() {
  return (
    // Two columns, the main one twice as wide; minmax(0, …) lets long content wrap instead of
    // widening a column.
    <Grid columns="minmax(0, 2fr) minmax(0, 1fr)" gap={6}>
      <Column gap={2}>
        <Text render={<h3 />} variant="title">
          Summary
        </Text>
        <Text>The spring launch moves the marketing pages to the new design.</Text>
      </Column>
      <DescriptionList.Root layout="stacked" aria-label="Project details">
        <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
        <DescriptionList.Item label="Due">14 May 2026</DescriptionList.Item>
      </DescriptionList.Root>
    </Grid>
  );
}
