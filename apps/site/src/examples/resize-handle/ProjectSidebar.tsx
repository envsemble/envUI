import { useRef, useState } from 'react';
import { Column, List, ResizeHandle, Row, Surface, Text, useContainerSize } from '@envsemble/envui';

const halfOfRow = (rowPixels: number) => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Math.min(Math.max(rowPixels / 2 / rem, 10), 20);
};

export default function ProjectSidebar() {
  const [width, setWidth] = useState(14);
  const row = useRef<HTMLDivElement>(null);
  const rowSize = useContainerSize(row);
  const room = rowSize ? halfOfRow(rowSize.inlineSize) : 20;
  const shown = Math.min(width, room);
  return (
    <Row ref={row} align="stretch" style={{ inlineSize: 'min(100%, 36rem)', blockSize: '16rem' }}>
      <Surface
        id="projects"
        radius="none"
        padding={2}
        style={{ inlineSize: `${shown}rem`, flex: 'none' }}
      >
        <List.Root aria-label="Projects">
          <List.Item label="Website refresh" current />
          <List.Item label="Northwind launch" />
          <List.Item label="Annual report" />
        </List.Root>
      </Surface>
      <ResizeHandle
        axis="inline"
        label="Resize the projects"
        aria-controls="projects"
        value={shown}
        room={(handle) => halfOfRow(handle.parentElement?.clientWidth ?? 0)}
        min={10}
        max={20}
        unit="rem"
        step={1}
        largeStep={5}
        onChange={setWidth}
      />
      <Column gap={2} padding={4} style={{ flex: 1, minInlineSize: 0 }}>
        <Text variant="title" render={<h3 />}>
          Website refresh
        </Text>
        <Text>The new home page goes live on March 12.</Text>
      </Column>
    </Row>
  );
}
