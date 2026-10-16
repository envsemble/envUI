import { useState } from 'react';
import { EnvUIProvider } from '@envsemble/envui';
// Internal primitives, which envUI's own components build on: the fixture mounts them directly.
import { ResizeHandle } from '../../packages/ui/src/internal/ResizeHandle.js';
import { useRovingFocus } from '../../packages/ui/src/internal/useRovingFocus.js';

const cells = Array.from({ length: 7 }, (_, index) => `${index + 1}`);

/** A resize handle and a roving grid that read the direction themselves. */
function DirectedControls() {
  const [width, setWidth] = useState(200);
  const [active, setActive] = useState<string | null>(null);
  const roving = useRovingFocus({
    items: cells,
    getKey: (cell) => cell,
    orientation: 'grid',
    columns: 7,
    activeKey: active,
    onActiveKeyChange: setActive,
  });
  return (
    <>
      <ResizeHandle
        axis="inline"
        label="Resize pane"
        value={width}
        min={100}
        max={400}
        onChange={(value) => setWidth(value)}
      />
      <div role="grid" aria-label="Days" {...roving.getContainerProps()}>
        {cells.map((cell) => (
          <div key={cell} role="gridcell" {...roving.getItemProps(cell)}>
            {cell}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Components whose keyboard follows the text direction, in RTL from a dir attribute and from
 * EnvUIProvider's dir, mounted with ?fixture=direction.
 */
export function DirectionFixture() {
  return (
    <>
      <div dir="rtl" data-testid="direction-attribute">
        <DirectedControls />
      </div>
      {/* The provider's direction applies without the attribute. */}
      <div data-testid="direction-provider">
        <EnvUIProvider dir="rtl">
          <DirectedControls />
        </EnvUIProvider>
      </div>
    </>
  );
}
