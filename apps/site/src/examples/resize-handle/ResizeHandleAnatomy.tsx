import { useState } from 'react';
import { CodeBlock, Column, ResizeHandle, Text } from '@envsemble/envui';

export default function ResizeHandleAnatomy() {
  const [height, setHeight] = useState(5);
  return (
    <Column style={{ inlineSize: 'min(100%, 28rem)', blockSize: '11rem' }}>
      <Column padding={3} style={{ flex: 1, minBlockSize: 0 }}>
        <Text>Deploy to staging</Text>
      </Column>
      <ResizeHandle
        axis="block"
        reverse
        label="Resize the logs"
        aria-controls="anatomy-logs"
        value={height}
        min={3}
        max={8}
        unit="rem"
        step={1}
        onChange={setHeight}
      />
      <CodeBlock
        id="anatomy-logs"
        label="Logs"
        style={{ blockSize: `${height}rem`, flex: 'none', overflow: 'auto' }}
      >
        {'Building the site\nRunning 214 tests'}
      </CodeBlock>
    </Column>
  );
}
