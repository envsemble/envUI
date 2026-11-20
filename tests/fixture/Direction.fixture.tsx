import { useState } from 'react';
import { useDirection as useBaseDirection } from '@base-ui/react/direction-provider';
import { EnvUIProvider, Menu, Menubar, SegmentedControl, Toolbar } from '@envsemble/envui';
import { ColorPicker } from '@envsemble/envui/color';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';
import { ResizeHandle } from '../../packages/ui/src/layout/ResizeHandle.js';

export const mount = 'standalone';

function DirectedControls() {
  const [width, setWidth] = useState(200);
  const [view, setView] = useState('list');
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
      <ColorPicker label="Accent" swatches={['#ff0000', '#00ff00', '#0000ff']} />
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

function BaseDirectionProbe({ testId }: { testId: string }) {
  return <output data-testid={testId}>{useBaseDirection()}</output>;
}

export default function DirectionFixture() {
  return (
    <>
      <div dir="ltr" data-testid="direction-switch">
        <Toolbar.Root aria-label="Switching">
          <Toolbar.Button icon={<IconFormatBold />} label="First" />
          <Toolbar.Button icon={<IconFormatItalic />} label="Second" />
          <Toolbar.Button icon={<IconFormatUnderlined />} label="Third" />
        </Toolbar.Root>
      </div>
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
      <div data-testid="direction-provider">
        <EnvUIProvider dir="rtl">
          <DirectedControls />
        </EnvUIProvider>
      </div>
    </>
  );
}
