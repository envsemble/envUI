import { useState } from 'react';
import { IconButton, Select, Stack, Surface, Text } from '@envsemble/envui';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { ZoomOut } from '@envsemble/envui/icons/ZoomOut';

const zoomLevels = ['50', '75', '100', '150', '200'];
const zoomOptions = zoomLevels.map((value) => ({ value, label: `${value}%` }));

export default function SmallToolbar() {
  const [zoom, setZoom] = useState<string | null>('100');
  const step = (direction: number) => {
    const index = zoomLevels.indexOf(zoom ?? '100') + direction;
    setZoom(zoomLevels[Math.min(Math.max(index, 0), zoomLevels.length - 1)] ?? '100');
  };
  return (
    // The toolbar is as wide as its controls.
    <Stack align="start">
      <Surface
        background="default"
        padding={1}
        radius="full"
        role="group"
        aria-label="Diagram"
        render={<Stack direction="row" wrap align="center" gap={4} />}
      >
        <Text render={<span />} variant="body-sm">
          Northwind launch plan
        </Text>
        <IconButton
          variant="text"
          size="sm"
          icon={<ZoomOut />}
          aria-label="Zoom out"
          onClick={() => step(-1)}
        />
        <Select
          size="sm"
          variant="outlined"
          aria-label="Zoom"
          options={zoomOptions}
          value={zoom}
          onValueChange={setZoom}
        />
        <IconButton
          variant="text"
          size="sm"
          icon={<ZoomIn />}
          aria-label="Zoom in"
          onClick={() => step(1)}
        />
      </Surface>
    </Stack>
  );
}
