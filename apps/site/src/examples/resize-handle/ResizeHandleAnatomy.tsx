import { useState } from 'react';
import { ResizeHandle, Row, Surface, Text } from '@envsemble/envui';

export default function ResizeHandleAnatomy() {
  const [width, setWidth] = useState(12);
  return (
    <Row align="stretch" style={{ inlineSize: 'min(100%, 28rem)', blockSize: '8rem' }}>
      <Surface
        id="files"
        radius="none"
        padding={3}
        style={{ inlineSize: `${width}rem`, flex: 'none' }}
      >
        <Text>Files</Text>
      </Surface>
      <ResizeHandle
        axis="inline"
        label="Resize the files"
        aria-controls="files"
        value={width}
        min={8}
        max={16}
        unit="rem"
        step={1}
        onChange={setWidth}
      />
      <Surface radius="none" padding={3} background="page" style={{ flex: 1 }}>
        <Text>Preview</Text>
      </Surface>
    </Row>
  );
}
