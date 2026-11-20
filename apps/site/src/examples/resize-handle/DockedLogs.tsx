import { useState } from 'react';
import { CodeBlock, Column, ResizeHandle, Text } from '@envsemble/envui';

const logs = [
  '12:04:31  Installing dependencies',
  '12:04:52  Building the site',
  '12:05:20  Running 214 tests',
  '12:05:58  214 passed',
  '12:06:03  Uploading to staging',
].join('\n');

export default function DockedLogs() {
  const [height, setHeight] = useState(8);
  return (
    <Column style={{ inlineSize: 'min(100%, 36rem)', blockSize: '18rem' }}>
      <Column gap={2} padding={4} style={{ flex: 1, minBlockSize: 0 }}>
        <Text variant="title" render={<h3 />}>
          Deploy to staging
        </Text>
        <Text>Started from main two minutes ago. Four of five steps are done.</Text>
      </Column>
      <ResizeHandle
        axis="block"
        reverse
        label="Resize the logs"
        aria-controls="deploy-logs"
        value={height}
        min={4}
        max={13}
        unit="rem"
        step={1}
        largeStep={4}
        onChange={setHeight}
      />
      <CodeBlock
        id="deploy-logs"
        label="Logs"
        style={{ blockSize: `${height}rem`, flex: 'none', overflow: 'auto' }}
      >
        {logs}
      </CodeBlock>
    </Column>
  );
}
