import { useState } from 'react';
import { Column, ResizeHandle, Text, Textarea } from '@envsemble/envui';

export default function WithoutAGrip() {
  const [height, setHeight] = useState(8);
  return (
    <Column style={{ inlineSize: 'min(100%, 28rem)' }}>
      <div style={{ blockSize: `${height}rem` }}>
        <Text variant="title" render={<h3 />}>
          Release notes
        </Text>
        <Text>Three fixes and a new export for the March release.</Text>
      </div>
      <ResizeHandle
        axis="block"
        label="Resize the notes"
        grip={false}
        value={height}
        min={4}
        max={12}
        unit="rem"
        step={1}
        onChange={setHeight}
      />
      <Textarea label="Comment" rows={2} />
    </Column>
  );
}
