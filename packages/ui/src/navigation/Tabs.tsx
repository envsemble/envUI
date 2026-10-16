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
  /** Button, IconButton, button-based NavList.Item, or a compatible native button component. */
  button: ReactElement<ComponentPropsWithRef<'button'>>;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps
  extends Omit<
    ComponentPropsWithRef<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'aria-label'
  > {
  items: readonly TabsItem[];
  /** Accessible name of the tab list. */
  'aria-label': string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Automatic selection on arrow-key focus; manual requires Enter or Space. */
  activation?: 'automatic' | 'manual';
  orientation?: 'horizontal' | 'vertical';
  /** Preserve local panel state while inactive. Hidden panels are inert. */
  keepMounted?: boolean;
  /** Wrap the supplied list in a custom layout, such as a Card with a heading. Render it once. */
  renderList?: (list: ReactElement) => ReactNode;
  listClassName?: string;
  panelClassName?: string;
  /**
   * The selected panel takes the height left below the list; give the Tabs a height (for example as
   * a flex child). For content that fills a region, such as a canvas.
   */
  fill?: boolean;
  /**
   * standard (default) matches buttons; compact makes the whole rail as tall as a compact control,
   * for toolbars and bars, like a compact `SegmentedControl`.
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

/** Linked tab panels; supplied buttons retain their own colors, geometry and behavior. */
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
