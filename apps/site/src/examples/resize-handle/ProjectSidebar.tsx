import { useState } from 'react';
import { Column, List, ResizeHandle, Row, Surface, Text } from '@envsemble/envui';

export default function ProjectSidebar() {
  const [width, setWidth] = useState(14);
  return (
    <Row align="stretch" style={{ inlineSize: 'min(100%, 36rem)', blockSize: '16rem' }}>
      <Surface
        id="projects"
        radius="none"
        padding={2}
        style={{ inlineSize: `${width}rem`, flex: 'none' }}
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
        value={width}
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
