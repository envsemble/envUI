import { useState } from 'react';
import { IconButton, Select, Column, Row, Text } from '@envsemble/envui';
import { IconZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { IconZoomOut } from '@envsemble/envui/icons/ZoomOut';

const zoomLevels = ['50', '75', '100', '150', '200'];
const zoomOptions = zoomLevels.map((value) => ({ value, label: `${value}%` }));

export default function SmallToolbar() {
  const [zoom, setZoom] = useState<string | null>('100');
  const step = (direction: number) => {
    const index = zoomLevels.indexOf(zoom ?? '100') + direction;
    setZoom(zoomLevels[Math.min(Math.max(index, 0), zoomLevels.length - 1)] ?? '100');
  };
  return (
    <Column gap={4} align="start">
      <Row wrap align="center" gap={4} role="group" aria-label="Diagram">
        <Text render={<span />} variant="body-sm">
          Northwind launch plan
        </Text>
        <Row align="center" gap={4}>
          <IconButton
            variant="ghost"
            size="sm"
            icon={<IconZoomOut />}
            aria-label="Zoom out"
            onClick={() => step(-1)}
          />
          <Select
            size="sm"
            aria-label="Zoom"
            items={zoomOptions}
            value={zoom}
            onValueChange={setZoom}
          />
          <IconButton
            variant="ghost"
            size="sm"
            icon={<IconZoomIn />}
            aria-label="Zoom in"
            onClick={() => step(1)}
          />
        </Row>
      </Row>
    </Column>
  );
}
