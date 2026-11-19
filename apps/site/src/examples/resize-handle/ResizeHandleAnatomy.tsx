import { useRef, useState } from 'react';
import { ResizeHandle, Row, Surface, Text, useContainerSize } from '@envsemble/envui';

const halfOfRow = (rowPixels: number) => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Math.min(Math.max(rowPixels / 2 / rem, 8), 16);
};

export default function ResizeHandleAnatomy() {
  const [width, setWidth] = useState(12);
  const row = useRef<HTMLDivElement>(null);
  const rowSize = useContainerSize(row);
  const room = rowSize ? halfOfRow(rowSize.inlineSize) : 16;
  const shown = Math.min(width, room);
  return (
    <Row ref={row} align="stretch" style={{ inlineSize: 'min(100%, 28rem)', blockSize: '8rem' }}>
      <Surface
        id="files"
        radius="none"
        padding={3}
        style={{ inlineSize: `${shown}rem`, flex: 'none' }}
      >
        <Text>Files</Text>
      </Surface>
      <ResizeHandle
        axis="inline"
        label="Resize the files"
        aria-controls="files"
        value={shown}
        room={(handle) => halfOfRow(handle.parentElement?.clientWidth ?? 0)}
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
