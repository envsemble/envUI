import { Stack, Text, breakpoints, useBreakpoint, type Breakpoint } from '@envsemble/envui';
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

/** One breakpoint, with whether this window is at least as wide. */
function BreakpointRow({ breakpoint }: { breakpoint: Breakpoint }) {
  const reached = useBreakpoint(breakpoint);
  return (
    <div className="docs-measure">
      <code>--env-breakpoint-{breakpoint}</code>
      <span>{breakpoints[breakpoint]}</span>
      <Text tone="muted">
        {reached ? 'This window is at least as wide' : 'This window is narrower'}
      </Text>
    </div>
  );
}

export function ResponsivePreview() {
  return (
    <>
      <Example
        title="Breakpoints"
        size="content"
        caption="Viewport widths in rem, for the page and the app frame; components follow their container instead."
      >
        <Stack gap={3}>
          {(Object.keys(breakpoints) as Breakpoint[]).map((breakpoint) => (
            <BreakpointRow key={breakpoint} breakpoint={breakpoint} />
          ))}
        </Stack>
      </Example>
      <Example
        title="Stacking order"
        size="content"
        caption="Every z-index comes from these levels, lowest first."
      >
        <Stack gap={3}>
          {stackingLevels.map(([level, use]) => (
            <div className="docs-measure" key={level}>
              <code>--env-z-{level}</code>
              <TokenValue token={`--env-z-${level}`} />
              <Text tone="muted">{use}</Text>
            </div>
          ))}
        </Stack>
      </Example>
    </>
  );
}
