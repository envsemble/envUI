'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useRender } from '@base-ui/react/use-render';
import { cloneElement, type ComponentPropsWithRef, type ReactElement, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import * as NavList from './NavList.js';
import { NavigationIconState } from '../MaterialSymbolState.js';
import { Surface } from '../foundations/Surface.js';

export interface TabsItem {
  /** Unique, stable identifier shared by the tab and its panel. */
  value: string;
  /**
   * The tab's control: a Button, an IconButton, a NavList.Item without href, or a component that
   * forwards native button props and its ref. It keeps its own look; a link is not allowed.
   */
  button: ReactElement<ComponentPropsWithRef<'button'>>;
  /** The panel's content, shown while the tab is selected. */
  content: ReactNode;
  /**
   * The tab cannot be selected; it is dimmed and reports aria-disabled, and the arrow keys still
   * reach it. A disabled button does the same.
   */
  disabled?: boolean;
}

export interface TabsProps
  extends Omit<
    ComponentPropsWithRef<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'aria-label'
  > {
  /** The tabs in order, each with its value, button and panel content. */
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
   * standard tabs are as tall as buttons; compact makes the whole rail as tall as a compact
   * control, 2 rem, for toolbars and bars, as a compact SegmentedControl is.
   * @default 'standard'
   */
  size?: 'standard' | 'compact';
}

function isDisabled(item: TabsItem) {
  return Boolean(item.disabled || item.button.props.disabled);
}

function TabButton({
  button,
  active,
  disabled,
  ...props
}: ComponentPropsWithRef<'button'> & {
  button: TabsItem['button'];
  active: boolean;
  disabled: boolean;
}) {
  if (button.type === 'a' || ('href' in button.props && button.props.href != null)) {
    throw new Error('Tabs items must render buttons. Use NavList.Item without href.');
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
  const render =
    button.type === NavList.Item
      ? cloneElement(tabButton as ReactElement<NavList.ItemProps>, {
          selected: active,
          'aria-current': false,
        })
      : tabButton;
  // Base UI composes the consumer's handlers and ref with its tab behavior.
  const element = useRender({ render, props });
  return <NavigationIconState selected={active}>{element}</NavigationIconState>;
}

/**
 * Switches between panels of related content in one place: a rail of the buttons you supply, each
 * a tab linked to its panel, with selection from the keyboard and panels that fade as they change.
 * The selected tab keeps its button's own look; the others are quiet on the rail.
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
  size = 'standard',
  ...props
}: TabsProps) {
  const initialValue =
    defaultValue === undefined
      ? (items.find((item) => !isDisabled(item))?.value ?? null)
      : defaultValue;
  const list = (
    <BaseTabs.List
      render={<Surface tone="row" padding={1} corners="pill" />}
      aria-label={label}
      data-size={size === 'compact' ? 'compact' : undefined}
      className={classNames('env-tabs-list', listClassName)}
      activateOnFocus={activation === 'automatic'}
    >
      {items.map((item) => (
        <BaseTabs.Tab
          key={item.value}
          value={item.value}
          disabled={isDisabled(item)}
          className="env-tab"
          render={(tabProps, state) => (
            <TabButton
              {...tabProps}
              button={item.button}
              active={state.active}
              disabled={state.disabled}
            />
          )}
        />
      ))}
    </BaseTabs.List>
  );
  return (
    <BaseTabs.Root
      {...props}
      className={classNames('env-tabs', className)}
      data-fill={fill ? '' : undefined}
      value={value}
      defaultValue={initialValue}
      onValueChange={onValueChange}
      orientation={orientation}
    >
      {renderList ? renderList(list) : list}
      <div className="env-tabs-panels">
        {items.map((item) => (
          <BaseTabs.Panel
            key={item.value}
            value={item.value}
            keepMounted={keepMounted}
            className={classNames('env-tab-panel', panelClassName)}
          >
            {item.content}
          </BaseTabs.Panel>
        ))}
      </div>
    </BaseTabs.Root>
  );
}
