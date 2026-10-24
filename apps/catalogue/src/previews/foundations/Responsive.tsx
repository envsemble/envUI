import { Column, Text, windowClasses, type WindowClass } from '@envsemble/envui';
import { Example } from '../Example';
import { TokenValue } from './TokenValue';

const stackingLevels = [
  ['base', 'The flow of a page or a component'],
  ['raised', 'A part over its siblings, such as a sticky table header'],
  ['sticky', 'The top bar and the navigation that content scrolls under'],
  ['peek', 'A pane over the content that does not dock, such as a sheet'],
  ['overlay', 'The scrim behind a modal layer'],
  ['modal', 'Dialogs, sheets and the command palette'],
  ['popover', 'Menus, popovers and select lists'],
  ['toast', 'Notifications'],
  ['tooltip', 'Tooltips'],
] as const;

const windowClassNames: Record<WindowClass, string> = {
  compact: 'Compact',
  medium: 'Medium',
  expanded: 'Expanded',
  large: 'Large',
};

const windowClassUses: Record<WindowClass, string> = {
  compact: 'A phone held upright, or a narrow pane',
  medium: 'A tablet held upright, or a narrow window',
  expanded: 'A tablet held sideways, or a laptop window',
  large: 'A desktop window',
};

export function ResponsivePreview() {
  return (
    <>
      <Example
        title="Window classes"
        size="content"
        explains
        caption="Widths in rem of the window around the application, not of the screen; each component follows the width of the space it sits in."
      >
        <Column gap={3}>
          {(Object.keys(windowClasses) as WindowClass[]).map((windowClass) => (
            <div className="docs-measure" key={windowClass}>
              <Text render={<span />} variant="body-sm">
                {windowClassNames[windowClass]}
              </Text>
              <span>from {windowClasses[windowClass]}</span>
              <Text emphasis="muted">{windowClassUses[windowClass]}</Text>
            </div>
          ))}
        </Column>
      </Example>
      <Example
        title="Stacking order"
        size="content"
        explains
        caption="Every layer takes one of these levels, lowest first."
      >
        <Column gap={3}>
          {stackingLevels.map(([level, use]) => (
            <div className="docs-measure" key={level}>
              <Text render={<span />} variant="body-sm">
                {level[0]!.toUpperCase() + level.slice(1)}
              </Text>
              <TokenValue token={`--env-z-${level}`} />
              <Text emphasis="muted">{use}</Text>
            </div>
          ))}
        </Column>
      </Example>
    </>
  );
}
