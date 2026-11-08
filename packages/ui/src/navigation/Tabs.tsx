'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useRender } from '@base-ui/react/use-render';
import { cloneElement, type ComponentPropsWithRef, type ReactElement, type ReactNode } from 'react';
import type { ControlSize } from '../foundations/Theme.js';
import { classNames } from '../internal/classNames.js';
import { Column, Grid, Row } from '../foundations/Layout.js';
import { useDirectionScope } from '../internal/useDirection.js';
import { NavigationIconState } from '../foundations/NavigationIconState.js';
import { Surface } from '../foundations/Surface.js';
import { Button } from '../actions/Button.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Tabs.css';

interface TabsItemFields {
  /** Unique, stable identifier shared by the tab and its panel. */
  value: string;
  /** The panel's content, shown while the tab is selected. */
  content: ReactNode;
  /**
   * The tab cannot be selected; it is dimmed and reports aria-disabled, and the arrow keys still
   * reach it. A disabled button does the same.
   */
  disabled?: boolean;
}

/** A tab's control: its label and icon, or a control of the application's own. */
type TabsItemControl =
  | {
      /** The tab's text, which names it. */
      label: ReactNode;
      /** A decorative icon before the label, such as one of envUI's Material Symbols. */
      icon?: ReactNode;
      button?: undefined;
    }
  | {
      label?: undefined;
      icon?: undefined;
      /**
       * The tab's control, in place of label and icon: a Button, an IconButton, or a component that
       * forwards native button props and its ref. It takes the tab's look, a text tab, whatever its
       * variant; a link is not allowed.
       */
      button: ReactElement<ComponentPropsWithRef<'button'>>;
    };

/** One tab and its panel: `{ value: 'summary', label: 'Summary', content: <Summary /> }`. */
export type TabsItem = TabsItemFields & TabsItemControl;

export interface TabsProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'aria-label'
> {
  /** The tabs in order, each with its value, its label or button, and its panel content. */
  items: readonly TabsItem[];
  /** The tab list's accessible name, such as Project views. */
  'aria-label': string;
  /** The selected tab's value, for controlled tabs; update it from onValueChange. */
  value?: string | null;
  /**
   * The tab that uncontrolled tabs start on.
   * @default the first enabled item's value
   */
  defaultValue?: string | null;
  /** Receives the value of the tab people select, by pressing it or from the keyboard. */
  onValueChange?: (value: string | null) => void;
  /**
   * automatic selects a tab as the arrow keys move focus to it; manual only moves focus, and Enter
   * or Space selects, for panels that take a moment to show.
   * @default 'automatic'
   */
  activation?: 'automatic' | 'manual';
  /**
   * horizontal puts the tabs in a row, moved through with the left and right arrow keys; vertical
   * in a column, with the up and down arrow keys. The panels stay below the list either way.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Keep the panels of unselected tabs mounted and hidden, so their state, such as a draft or a
   * scroll position, survives switching; otherwise a panel unmounts once it has faded out.
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Places the tab list in a layout of your own, such as beside a heading: it receives the list and
   * returns what to render in its place, with the list in it once. The panels stay below.
   */
  renderList?: (list: ReactElement) => ReactNode;
  /** A class for the tab list, the rail that holds the tabs. */
  listClassName?: string;
  /** A class for every panel. */
  panelClassName?: string;
  /**
   * The selected panel takes the height left below the list, for content that fills a region,
   * such as a canvas; give the tabs a height, for example as a flex child.
   * @default false
   */
  fill?: boolean;
  /**
   * The rail's height, as on every control: sm, md or lg in the current scale. The tabs inside are
   * a little shorter. lg gives tabs as tall as md buttons; sm suits a toolbar or a bar, beside a
   * SegmentedControl or buttons of size sm.
   * @default 'lg'
   */
  size?: ControlSize;
}

function isDisabled(item: TabsItem) {
  return Boolean(item.disabled || item.button?.props.disabled);
}

/**
 * The item's control: its own button, or a ghost button with its label and icon, which keeps a
 * button's inline padding, so neighbouring tabs stay apart. The tab takes a text tab's look either way.
 */
function buttonOf(item: TabsItem): ReactElement<ComponentPropsWithRef<'button'>> {
  return (
    item.button ?? (
      <Button variant="ghost" startIcon={item.icon}>
        {item.label}
      </Button>
    )
  );
}

function TabButton({
  button,
  active,
  disabled,
  ...props
}: ComponentPropsWithRef<'button'> & {
  button: ReactElement<ComponentPropsWithRef<'button'>>;
  active: boolean;
  disabled: boolean;
}) {
  if (button.type === 'a' || ('href' in button.props && button.props.href != null)) {
    throw new Error('Tabs items must render buttons. Use a Button without href.');
  }
  const tabButton = cloneElement(button, {
    type: 'button',
    disabled,
    role: 'tab',
    id: props.id,
    tabIndex: props.tabIndex,
    'aria-selected': active,
    'aria-controls': props['aria-controls'],
  });
  // Base UI composes the consumer's handlers and ref with its tab behavior.
  const element = useRender({ render: tabButton, props });
  return <NavigationIconState selected={active}>{element}</NavigationIconState>;
}

/**
 * Switches between panels of related content in one place: a rail of the buttons you supply, each
 * a tab linked to its panel, with selection from the keyboard and panels that fade as they change.
 * Every tab is a text tab, the selected one in the accent color with an indicator under it.
 */
export function Tabs({
  items,
  'aria-label': label,
  value,
  defaultValue,
  onValueChange,
  activation = 'automatic',
  orientation = 'horizontal',
  keepMounted = false,
  renderList,
  className,
  listClassName,
  panelClassName,
  fill = false,
  size = 'lg',
  ref,
  onFocus,
  ...props
}: TabsProps) {
  // A horizontal tab list's arrow keys follow the text direction, which Base UI only knows from
  // its own provider. Only the list reads it: the panels keep the direction around the tabs, so a
  // slider or a popup in a panel of another direction follows its own.
  const scope = useDirectionScope(ref);
  const initialValue =
    defaultValue === undefined
      ? (items.find((item) => !isDisabled(item))?.value ?? null)
      : defaultValue;
  const list = (
    <DirectionProvider direction={scope.direction}>
      <BaseTabs.List
        render={
          <Surface
            background="muted"
            radius="full"
            render={
              orientation === 'vertical' ? (
                <Column align="stretch" gap={1} />
              ) : (
                <Row align="center" gap={1} />
              )
            }
          />
        }
        aria-label={label}
        data-size={size}
        className={classNames('env-tabs-list', listClassName)}
        activateOnFocus={activation === 'automatic'}
      >
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            disabled={isDisabled(item)}
            className="env-tabs-tab"
            render={(tabProps, state) => (
              <TabButton
                {...tabProps}
                button={buttonOf(item)}
                active={state.active}
                disabled={state.disabled}
              />
            )}
          />
        ))}
        {/* One indicator, which moves to the selected tab; until it has measured the tab, as in the
            server's markup, the selected tab draws its own. */}
        <BaseTabs.Indicator className="env-tabs-indicator" />
      </BaseTabs.List>
    </DirectionProvider>
  );
  return (
    <BaseTabs.Root
      render={<Column gap={4} />}
      {...props}
      ref={scope.ref}
      onFocus={(event) => {
        scope.onFocus();
        onFocus?.(event);
      }}
      className={classNames('env-tabs', className)}
      data-fill={flag(fill)}
      value={value}
      defaultValue={initialValue}
      onValueChange={onValueChange}
      orientation={orientation}
    >
      {renderList ? renderList(list) : list}
      <Grid className="env-tabs-panels">
        {items.map((item) => (
          <BaseTabs.Panel
            key={item.value}
            value={item.value}
            keepMounted={keepMounted}
            className={classNames('env-tabs-panel', panelClassName)}
          >
            {item.content}
          </BaseTabs.Panel>
        ))}
      </Grid>
    </BaseTabs.Root>
  );
}
