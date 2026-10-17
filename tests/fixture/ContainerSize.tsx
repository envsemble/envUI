import { useRef, useState } from 'react';
import { Button, Stack, useContainerSize } from '@envsemble/envui';

/** A box whose width the test changes, with its content and border sizes, and one in vertical text. */
export function ContainerSizeFixture() {
  const [width, setWidth] = useState(300);
  const box = useRef<HTMLDivElement>(null);
  const content = useContainerSize(box);
  const border = useContainerSize(box, { box: 'border-box' });
  const [vertical, setVertical] = useState<HTMLDivElement | null>(null);
  const verticalSize = useContainerSize(vertical);
  const format = (size?: { inlineSize: number; blockSize: number }) =>
    size ? `${Math.round(size.inlineSize)} × ${Math.round(size.blockSize)}` : 'unmeasured';
  return (
    <Stack gap={4} className="fixture-section">
      <Button variant="secondary" onClick={() => setWidth(420)}>
        Widen the box
      </Button>
      <div
        ref={box}
        // envUI's reset sizes boxes by their border box: 300 by 100 with the padding and border.
        style={{
          inlineSize: `${width}px`,
          blockSize: '100px',
          padding: '10px',
          border: '2px solid',
        }}
      />
      <output data-testid="content-size">{format(content)}</output>
      <output data-testid="border-size">{format(border)}</output>
      <div
        ref={setVertical}
        style={{ writingMode: 'vertical-rl', inlineSize: '80px', blockSize: '200px' }}
      />
      <output data-testid="vertical-size">{format(verticalSize)}</output>
    </Stack>
  );
}
