import { Avatar, Badge, Button, Column, DescriptionList, PageHeader, Text } from '@envsemble/envui';
import { WidthSweep } from '../../motion/WidthSweep';
import type { FoundationFigureEntry } from './FoundationFigures';
import { ClassTextSizeFigure } from './ResponsiveTextSize';
import { FoundationFrame, type LegendEntry } from './FoundationFrame';

function Profile() {
  return (
    <Column gap={5}>
      <PageHeader
        title="Sam Lee"
        headingLevel={3}
        description="Product designer"
        start={<Avatar name="Sam Lee" />}
        meta={<Badge>Admin</Badge>}
        actions={
          <>
            <Button variant="secondary">Message</Button>
            <Button>Edit profile</Button>
          </>
        }
      />
      <DescriptionList.Root aria-label="Profile details">
        <DescriptionList.Item label="Team">Research</DescriptionList.Item>
        <DescriptionList.Item label="Location">Lisbon</DescriptionList.Item>
        <DescriptionList.Item label="Joined">4 March 2026</DescriptionList.Item>
      </DescriptionList.Root>
    </Column>
  );
}

function WidthsFigure({ legend }: { legend: readonly LegendEntry[] }) {
  return (
    <FoundationFrame
      label="One profile, from a narrow pane to room to spare"
      motion="the profile from a narrow pane to room to spare"
      legend={
        <div className="catalogue-width-legend">
          {legend.map((entry) => (
            <div key={entry.name} className="catalogue-topic-text">
              <Text render={<p />} variant="title">
                {entry.name}
              </Text>
              <Text render={<p />} variant="body-sm" emphasis="muted">
                {entry.text}
              </Text>
            </div>
          ))}
        </div>
      }
    >
      <WidthSweep widths={[18, 44]} hold={1600} classes="only" crop>
        <Profile />
      </WidthSweep>
    </FoundationFrame>
  );
}

export const responsiveFigures: Record<string, FoundationFigureEntry> = {
  Widths: { render: WidthsFigure, wide: true },
  TextSize: { render: ClassTextSizeFigure, wide: true },
};
