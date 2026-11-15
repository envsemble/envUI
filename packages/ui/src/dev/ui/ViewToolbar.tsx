'use client';

import { memo, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Button } from '../../actions/Button.js';
import * as Toolbar from '../../actions/Toolbar.js';
import * as DescriptionList from '../../data-display/DescriptionList.js';
import { Kbd } from '../../content/Kbd.js';
import { Popover } from '../../overlays/Popover.js';
import { Slider } from '../../forms/Slider.js';
import { Switch } from '../../forms/Switch.js';
import { Column, Grid, Row } from '../../layout/Layout.js';
import { Surface } from '../../layout/Surface.js';
import { IconFilterAlt } from '../../icons/FilterAlt.js';
import { IconInfo } from '../../icons/Info.js';
import { IconLabel } from '../../icons/Label.js';
import { IconLayers } from '../../icons/Layers.js';
import { IconPadding } from '../../icons/Padding.js';
import { IconPalette } from '../../icons/Palette.js';
import { IconResponsiveLayout } from '../../icons/ResponsiveLayout.js';
import { IconStayCurrentLandscape } from '../../icons/StayCurrentLandscape.js';
import { IconStayCurrentPortrait } from '../../icons/StayCurrentPortrait.js';
import { IconTune } from '../../icons/Tune.js';
import { IconViewInAr } from '../../icons/ViewInAr.js';
import * as Menu from '../../actions/menu/Menu.js';
import { angles, type Angle } from './camera.js';
import { HintedIconButton, SidebarToggle, noTooltipDelay, type Side } from './Controls.js';
import { deviceGroups } from './devices.js';
import { pageOwnSize, type FrameSize } from './Frame.js';
import { ViewFront, ViewLeft, ViewRight, ViewTilted, ViewTop } from './Icons.js';

export interface ShowOptions {
  names: boolean;
  spacing: boolean;
  onlySelected: boolean;
  colorBy: 'kind' | 'window';
}

interface Levels {
  spacing: number;
  from: number;
  to: number;
  highestLevel: number;
}

const angleIcons: Record<Angle, ReactNode> = {
  tilted: <ViewTilted />,
  front: <ViewFront />,
  top: <ViewTop />,
  left: <ViewLeft />,
  right: <ViewRight />,
};

const angleGridRows: (Angle | null)[][] = [
  [null, 'top', 'tilted'],
  ['left', 'front', 'right'],
];
const angleGrid = angleGridRows.flat();

const keepPointerFromTheView = (event: ReactPointerEvent) => event.stopPropagation();

export interface ViewToolbarProps {
  angle: Angle | null;
  onAngle: (angle: Angle) => void;
  show: ShowOptions;
  onShowChange: (show: ShowOptions) => void;
  frame: FrameSize;
  pageSize: { w: number; h: number };
  onFrameChange: (frame: FrameSize) => void;
  levels: Levels;
  onLevelsChange: (levels: Omit<Levels, 'highestLevel'>) => void;
  debug: boolean;
  onDebugChange: (debug: boolean) => void;
}

export const ViewToolbar = memo(function ViewToolbar({
  angle,
  onAngle,
  show,
  onShowChange,
  frame,
  pageSize,
  onFrameChange,
  levels,
  onLevelsChange,
  debug,
  onDebugChange,
}: ViewToolbarProps) {
  return (
    <Surface
      padding={1}
      radius="full"
      render={<Toolbar.Root aria-label="3D view" size="sm" tooltipDelay={noTooltipDelay} />}
      className="env-dev-float env-dev-toolbar"
      onPointerDown={keepPointerFromTheView}
    >
      <ViewMenu angle={angle} onAngle={onAngle} />
      <ShowMenu show={show} onShowChange={onShowChange} />
      <ResponsiveMenu frame={frame} pageSize={pageSize} onFrameChange={onFrameChange} />
      <ViewSettings
        levels={levels}
        onLevelsChange={onLevelsChange}
        debug={debug}
        onDebugChange={onDebugChange}
      />
    </Surface>
  );
});

function ViewMenu({ angle, onAngle }: { angle: Angle | null; onAngle: (angle: Angle) => void }) {
  return (
    <Popover aria-label="View" trigger={<Toolbar.Button icon={<IconViewInAr />} label="View" />}>
      {(close) => (
        <Grid columns={3} gap={1} role="group" aria-label="Angles">
          {angleGrid.map((cell, index) =>
            cell === null ? (
              <span key={index} />
            ) : (
              <Button
                key={cell}
                size="sm"
                variant={angle === cell ? 'secondary' : 'ghost'}
                aria-pressed={angle === cell}
                startIcon={angleIcons[cell]}
                onClick={() => {
                  onAngle(cell);
                  close();
                }}
              >
                {angles[cell].label}
              </Button>
            ),
          )}
        </Grid>
      )}
    </Popover>
  );
}

function ShowMenu({
  show,
  onShowChange,
}: {
  show: ShowOptions;
  onShowChange: (show: ShowOptions) => void;
}) {
  return (
    <Menu.Root
      aria-label="Show"
      align="center"
      trigger={<Toolbar.Button icon={<IconLayers />} label="Show" />}
    >
      <Menu.CheckboxItem
        icon={<IconLabel />}
        checked={show.names}
        onCheckedChange={(names) => onShowChange({ ...show, names })}
      >
        Names
      </Menu.CheckboxItem>
      <Menu.CheckboxItem
        icon={<IconPadding />}
        checked={show.spacing}
        onCheckedChange={(spacing) => onShowChange({ ...show, spacing })}
      >
        Padding and gaps
      </Menu.CheckboxItem>
      <Menu.CheckboxItem
        icon={<IconFilterAlt />}
        description="And what is inside it"
        checked={show.onlySelected}
        onCheckedChange={(onlySelected) => onShowChange({ ...show, onlySelected })}
      >
        Only the selected
      </Menu.CheckboxItem>
      <Menu.CheckboxItem
        icon={<IconPalette />}
        checked={show.colorBy === 'window'}
        onCheckedChange={(on) => onShowChange({ ...show, colorBy: on ? 'window' : 'kind' })}
      >
        Color by window class
      </Menu.CheckboxItem>
    </Menu.Root>
  );
}

function ResponsiveMenu({
  frame,
  pageSize,
  onFrameChange,
}: {
  frame: FrameSize;
  pageSize: { w: number; h: number };
  onFrameChange: (frame: FrameSize) => void;
}) {
  const on = frame.width !== null || frame.height !== null;
  const frameWidth = frame.width ?? Math.round(pageSize.w);
  const frameHeight = frame.height ?? Math.round(pageSize.h);
  const orientation = frameWidth > frameHeight ? 'landscape' : 'portrait';
  const pickDevice = (name: string) => {
    if (name === 'any') {
      onFrameChange({ width: frameWidth, height: frameHeight, device: null });
      return;
    }
    for (const group of deviceGroups) {
      const device = group.devices.find((candidate) => candidate.name === name);
      if (device) onFrameChange({ width: device.width, height: device.height, device: name });
    }
  };
  return (
    <Menu.Root
      aria-label="Responsive"
      align="center"
      trigger={<Toolbar.Button icon={<IconResponsiveLayout />} label="Responsive" />}
    >
      <Menu.CheckboxItem
        icon={<IconResponsiveLayout />}
        description="Lays the page out at another size"
        checked={on}
        onCheckedChange={(next) =>
          onFrameChange(
            next
              ? { width: Math.round(pageSize.w), height: Math.round(pageSize.h), device: null }
              : pageOwnSize,
          )
        }
      >
        Responsive frame
      </Menu.CheckboxItem>
      <Menu.Separator />
      <Menu.Submenu label="Device" description={frame.device ?? 'Any size'} disabled={!on}>
        <Menu.RadioGroup value={frame.device ?? 'any'} onValueChange={pickDevice}>
          <Menu.RadioItem value="any" description="Drag the frame to size it">
            Any size
          </Menu.RadioItem>
        </Menu.RadioGroup>
        {deviceGroups.map((group) => (
          <Menu.RadioGroup
            key={group.label}
            label={group.label}
            value={frame.device ?? 'any'}
            onValueChange={pickDevice}
          >
            {group.devices.map((device) => (
              <Menu.RadioItem
                key={device.name}
                value={device.name}
                description={`${device.width}×${device.height}`}
              >
                {device.name}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        ))}
      </Menu.Submenu>
      <Menu.RadioGroup
        label="Orientation"
        value={orientation}
        onValueChange={(next) => {
          if (next !== orientation)
            onFrameChange({ width: frameHeight, height: frameWidth, device: frame.device });
        }}
      >
        <Menu.RadioItem value="portrait" icon={<IconStayCurrentPortrait />} disabled={!on}>
          Portrait
        </Menu.RadioItem>
        <Menu.RadioItem value="landscape" icon={<IconStayCurrentLandscape />} disabled={!on}>
          Landscape
        </Menu.RadioItem>
      </Menu.RadioGroup>
    </Menu.Root>
  );
}

function ViewSettings({
  levels,
  onLevelsChange,
  debug,
  onDebugChange,
}: {
  levels: Levels;
  onLevelsChange: (levels: Omit<Levels, 'highestLevel'>) => void;
  debug: boolean;
  onDebugChange: (debug: boolean) => void;
}) {
  const { spacing, from, to, highestLevel } = levels;
  return (
    <Popover
      title="View settings"
      trigger={<Toolbar.Button icon={<IconTune />} label="View settings" />}
    >
      <Column gap={3}>
        <Slider
          label="Spacing between levels"
          min={0}
          max={160}
          value={spacing}
          onValueChange={(value) => onLevelsChange({ spacing: value, from, to })}
          formatValue={(value) => `${value} px`}
        />
        <Slider
          label="From level"
          min={0}
          max={Math.max(1, highestLevel)}
          value={from}
          onValueChange={(value) =>
            onLevelsChange({ spacing, from: value, to: Math.max(to, value) })
          }
        />
        <Slider
          label="To level"
          min={0}
          max={Math.max(1, highestLevel)}
          value={to}
          onValueChange={(value) =>
            onLevelsChange({ spacing, from: Math.min(from, value), to: value })
          }
        />
        <Switch label="Performance" checked={debug} onCheckedChange={onDebugChange} />
      </Column>
    </Popover>
  );
}

function MovingAround() {
  return (
    <DescriptionList.Root layout="stacked">
      <DescriptionList.Item label="Turn">Drag.</DescriptionList.Item>
      <DescriptionList.Item label="Pan">
        <Kbd keys={['Shift']} /> and drag, or drag with the middle button.
      </DescriptionList.Item>
      <DescriptionList.Item label="Scroll and zoom">
        The wheel scrolls what is under the pointer, or zooms where nothing there scrolls;{' '}
        <Kbd keys={['Ctrl']} /> and the wheel zoom.
      </DescriptionList.Item>
      <DescriptionList.Item label="Bring the page back">
        Pick the angle the view is at in View.
      </DescriptionList.Item>
      <DescriptionList.Item label="Select">
        Click a plane, or a node in the tree. Show, Only the selected shows it and what is inside
        it.
      </DescriptionList.Item>
      <DescriptionList.Item label="Resize the page">
        Turn on Responsive frame, then drag a handle of the frame, or use the arrow keys on an
        edge&apos;s handle.
      </DescriptionList.Item>
    </DescriptionList.Root>
  );
}

export const ViewCorners = memo(function ViewCorners({
  sides,
  onShow,
}: {
  sides: { tree: boolean; inspector: boolean };
  onShow: (side: Side) => void;
}) {
  return (
    <>
      {sides.tree ? null : (
        <Surface
          padding={1}
          radius="full"
          className="env-dev-float env-dev-corner"
          data-side="start"
          onPointerDown={keepPointerFromTheView}
        >
          <SidebarToggle side="tree" shown={false} onClick={() => onShow('tree')} />
        </Surface>
      )}
      <Surface
        padding={1}
        radius="full"
        render={<Row gap={1} align="center" />}
        className="env-dev-float env-dev-corner"
        data-side="end"
        onPointerDown={keepPointerFromTheView}
      >
        <Popover
          title="Moving around"
          side="bottom"
          align="end"
          trigger={
            <HintedIconButton
              label="How to move around"
              icon={<IconInfo />}
              size="sm"
              side="inline-start"
            />
          }
        >
          <MovingAround />
        </Popover>
        {sides.inspector ? null : (
          <SidebarToggle side="inspector" shown={false} onClick={() => onShow('inspector')} />
        )}
      </Surface>
    </>
  );
});
