import { Column, Text, windowClasses, type WindowClass } from '@envsemble/envui';
import { Example } from '../Example';
import { TokenValue } from './TokenValue';

const stackingLevels = [
  ['base', 'The flow of a page or a component'],
  ['raised', 'A part over its siblings, such as a sticky table header'],
  ['sticky', 'The app header and the sidebar columns'],
  ['peek', 'A collapsed sidebar opened over the content'],
  ['overlay', 'The scrim behind a modal layer'],
  ['modal', 'Dialogs, drawers and the command palette'],
  ['popover', 'Menus, popovers and select lists'],
  ['toast', 'Notifications'],
  ['tooltip', 'Tooltips'],
] as const;

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
        caption="Container widths in rem, from the theme boundary, the env-window container; components follow their own container."
      >
        <Column gap={3}>
          {(Object.keys(windowClasses) as WindowClass[]).map((windowClass) => (
            <div className="docs-measure" key={windowClass}>
              <code>{windowClass}</code>
              <span>from {windowClasses[windowClass]}</span>
              <Text emphasis="muted">{windowClassUses[windowClass]}</Text>
            </div>
          ))}
        </Column>
      </Example>
      <Example
        title="Stacking order"
        size="content"
        caption="Every z-index comes from these levels, lowest first."
      >
        <Column gap={3}>
          {stackingLevels.map(([level, use]) => (
            <div className="docs-measure" key={level}>
              <code>--env-z-{level}</code>
              <TokenValue token={`--env-z-${level}`} />
              <Text emphasis="muted">{use}</Text>
            </div>
          ))}
        </Column>
      </Example>
    </>
  );
}
