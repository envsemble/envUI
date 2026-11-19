import {
  CalendarHeatmap,
  CalendarHeatmapLegend,
  Column,
  Row,
  Text,
  type CalendarHeatmapDay,
} from '@envsemble/envui';

const data: CalendarHeatmapDay[] = Array.from({ length: 84 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 0, 5) + index * 86_400_000).toISOString().slice(0, 10),
  value: index % 7 > 4 ? 0 : Math.round((Math.cos(index / 6) + 1) * 4),
}));

export default function LegendBesideHeading() {
  return (
    <Column gap={3}>
      <Row wrap align="center" justify="between" gap={3}>
        <Text variant="title" render={<h3 id="deploys-heading" />}>
          Deploys
        </Text>
        <CalendarHeatmapLegend tone="success" lessLabel="0" moreLabel="8+" />
      </Row>
      <CalendarHeatmap
        aria-labelledby="deploys-heading"
        data={data}
        tone="success"
        legend={false}
      />
    </Column>
  );
}
