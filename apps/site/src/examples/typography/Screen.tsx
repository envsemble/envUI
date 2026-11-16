import { Badge, Column, Row, Text } from '@envsemble/envui';

export default function Screen() {
  return (
    <Column gap={6}>
      <Text render={<h3 />} variant="headline">
        Quarterly report
      </Text>
      <Column gap={2} align="start">
        <Row gap={2} align="center">
          <Text render={<h4 />} variant="title">
            Budget
          </Text>
          <Badge tone="success">On track</Badge>
        </Row>
        <Text>
          Spending is within the plan, with most of the quarter&apos;s travel already booked.
        </Text>
        <Text variant="body-sm">Updated today by Priya Shah</Text>
      </Column>
      <Text variant="caption">Figures include tax.</Text>
    </Column>
  );
}
