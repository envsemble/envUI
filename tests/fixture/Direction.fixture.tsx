import { useState } from 'react';
import { useDirection as useBaseDirection } from '@base-ui/react/direction-provider';
import {
  Button,
  EnvUIProvider,
  Menu,
  Menubar,
  SegmentedControl,
  Tabs,
  Text,
  Toolbar,
} from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';
// Internal primitives, which envUI's own components build on: the fixture mounts them directly.
import { ResizeHandle } from '../../packages/ui/src/internal/ResizeHandle.js';
import { useRovingFocus } from '../../packages/ui/src/internal/useRovingFocus.js';

const cells = Array.from({ length: 7 }, (_, index) => `${index + 1}`);

/**
 * A resize handle and a roving grid, which read the direction themselves, and the components on
 * Base UI parts whose arrow keys follow the direction Base UI is told.
 */
function DirectedControls() {
  const [width, setWidth] = useState(200);
  const [active, setActive] = useState<string | null>(null);
  const [view, setView] = useState('list');
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
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button icon={<IconFormatBold />} label="Bold" />
        <Toolbar.Button icon={<IconFormatItalic />} label="Italic" />
        <Toolbar.Button icon={<IconFormatUnderlined />} label="Underline" />
      </Toolbar.Root>
      <SegmentedControl
        aria-label="View"
        value={view}
        onValueChange={setView}
        items={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
          { value: 'calendar', label: 'Calendar' },
        ]}
      />
      <Tabs
        aria-label="Sections"
        items={['Overview', 'Activity', 'Settings'].map((name) => ({
          value: name,
          button: <Button>{name}</Button>,
          content: <Text>{name}</Text>,
        }))}
      />
      <Menubar.Root aria-label="Application">
        {['File', 'Edit', 'View'].map((name) => (
          <Menubar.Menu key={name} label={name}>
            <Menu.Item>{name} item</Menu.Item>
          </Menubar.Menu>
        ))}
      </Menubar.Root>
    </>
  );
}

/** The direction Base UI's parts read where it renders. */
function BaseDirectionProbe({ testId }: { testId: string }) {
  return <output data-testid={testId}>{useBaseDirection()}</output>;
}

/**
 * Components whose keyboard follows the text direction, in RTL from a dir attribute and from
 * EnvUIProvider's dir, mounted with ?fixture=direction; a region whose dir attribute changes; and
 * what Base UI's parts read inside a toolbar.
 */
export function DirectionFixture() {
  return (
    <>
      {/* The test switches this region's dir while focus stays in its toolbar. */}
      <div dir="ltr" data-testid="direction-switch">
        <Toolbar.Root aria-label="Switching">
          <Toolbar.Button icon={<IconFormatBold />} label="First" />
          <Toolbar.Button icon={<IconFormatItalic />} label="Second" />
          <Toolbar.Button icon={<IconFormatUnderlined />} label="Third" />
        </Toolbar.Root>
      </div>
      {/* Only the toolbar's own keyboard takes its direction: the parts inside keep theirs. */}
      <div dir="rtl" data-testid="direction-nested">
        <BaseDirectionProbe testId="base-direction-outside" />
        <Toolbar.Root aria-label="Nested">
          <Toolbar.Button icon={<IconFormatBold />} label="Nested bold" />
          <BaseDirectionProbe testId="base-direction-inside" />
        </Toolbar.Root>
      </div>
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
