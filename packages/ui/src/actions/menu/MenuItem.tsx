'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  useId,
  type AriaAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { Kbd } from '../../content/Kbd.js';
import { Slot } from '../../internal/layout/Slot.js';
import { useLinkComponent } from '../../internal/provider/LinkComponentContext.js';
import { keyShortcuts, shortcutChords } from '../internal/shortcuts.js';
import { idRefs } from '../../internal/dom/idRefs.js';
import '../../styles/Base.css';
import '../../styles/Menu.css';

export interface ItemContentProps {
  /**
   * Content before the label, such as the Settings icon or an Avatar in an account switcher: an
   * envUI icon takes the icon size and other content keeps its own, and the labels of the menu's
   * rows still line up. It is hidden from assistive technology, since the label names the item.
   */
  start?: ReactNode;
  /** The item's label, which names it. */
  children: ReactNode;
  /**
   * The label as plain text, which typing a letter in the open menu matches, where children isn't a
   * string, such as a label with a Badge or emphasis inside.
   * @default children, when it is a string
   */
  textValue?: string;
  /** A second, muted line; announced as the item's description. */
  description?: ReactNode;
  /**
   * Keyboard hint at the end, such as Ctrl+P, shown as Kbd keys and announced as aria-keyshortcuts;
   * a sequence, such as Ctrl+K Ctrl+S, shows its keys without the attribute. The application
   * handles the shortcut itself.
   */
  shortcut?: string;
  /** End content, such as a Badge or a count; it is part of the item's name. */
  end?: ReactNode;
}

const endContentSeparateWordInName = ' ';

/** Shared item layout: indicator, start, label with optional description, end content, shortcut. */
export function useMenuItemContent(
  {
    start,
    children,
    textValue,
    description,
    shortcut,
    end,
    'aria-describedby': ownDescribedBy,
  }: ItemContentProps & { 'aria-describedby'?: string },
  indicator?: ReactNode,
) {
  const descriptionId = useId();
  const chords = shortcut ? shortcutChords(shortcut) : [];
  const content = (
    <>
      {indicator}
      {start != null && (
        <Slot
          className="env-menu-item-start"
          element="span"
          layout="row"
          shrink="never"
          aria-hidden
        >
          {start}
        </Slot>
      )}
      <span className="env-menu-item-text">
        <span className="env-menu-item-label">{children}</span>
        {description != null && (
          <span className="env-menu-item-description" id={descriptionId} aria-hidden="true">
            {description}
          </span>
        )}
      </span>
      {end != null && (
        <>
          {endContentSeparateWordInName}
          <span className="env-menu-item-end">{end}</span>
        </>
      )}
      {chords.length > 0 && (
        <span className="env-menu-item-shortcut" aria-hidden="true">
          {chords.map((keys, index) => (
            <Kbd key={index} keys={keys} />
          ))}
        </span>
      )}
    </>
  );
  const describedBy = idRefs(ownDescribedBy, description != null ? descriptionId : undefined);
  return {
    content,
    accessibility: {
      label: typeof children === 'string' ? children : textValue,
      'aria-describedby': describedBy,
      'aria-keyshortcuts': keyShortcuts(chords),
    },
  };
}

/**
 * The native attributes a menu item passes to its row element, such as style, id, a test id or an
 * analytics data attribute.
 */
export interface ItemElementProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'onClick' | 'className' | 'aria-label' | 'aria-current'
> {
  /** The item's row element. */
  ref?: Ref<HTMLElement>;
  [attribute: `data-${string}`]: string | number | boolean | undefined;
}

interface ItemSharedProps extends ItemContentProps, ItemElementProps {
  /**
   * The item's tone: danger marks a destructive action, such as Delete, its label and icon in the
   * danger color; its row highlights as any other's.
   * @default 'neutral'
   */
  tone?: 'neutral' | 'danger';
  /**
   * The item is unavailable: it stays in place, dimmed, and reports aria-disabled; its action does
   * not run, and a destination has no link to follow.
   * @default false
   */
  disabled?: boolean;
  /**
   * Marks a destination as the page shown now, such as aria-current="page" on the current one of a
   * NavigationBar's destinations that its More menu holds.
   */
  'aria-current'?: AriaAttributes['aria-current'];
  /**
   * The item's accessible name, where its label and end content don't say it as wanted, such as
   * Inbox, 3 new for a destination whose count shows as a badge.
   */
  'aria-label'?: string;
  /** Class of the item's row. */
  className?: string;
}

export type ItemProps = ItemSharedProps &
  (
    | {
        /**
         * The destination: the item is a link, through the LinkProvider's link component, and the
         * menu closes as it is followed.
         */
        href: string;
        /**
         * Runs as the destination is followed, before the menu closes, such as to record the
         * choice; the link still navigates.
         */
        onClick?: (event: MouseEvent<HTMLElement>) => void;
        /** Where the destination opens, such as _blank, as on a native link. */
        target?: string;
        /** The destination's relationship to the page, such as noopener, as on a native link. */
        rel?: string;
        closeOnClick?: never;
      }
    | {
        href?: undefined;
        /** The action, run when the item is chosen; the menu then closes unless closeOnClick is false. */
        onClick?: (event: MouseEvent<HTMLElement>) => void;
        target?: never;
        rel?: never;
        /**
         * Close the menu once the action runs; false keeps it open, for an action people repeat,
         * such as Zoom in.
         * @default true
         */
        closeOnClick?: boolean;
      }
  );

const disabledDestinationFollowsNothing = (event: MouseEvent<HTMLElement>) =>
  event.preventDefault();

/**
 * One action (onClick) or destination (href) in a Menu. Destinations use the LinkProvider's link
 * and close the menu as they are followed.
 */
export function Item({
  start,
  children,
  textValue,
  description,
  shortcut,
  end,
  'aria-describedby': ariaDescribedBy,
  tone = 'neutral',
  disabled,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
  className,
  href,
  onClick,
  target,
  rel,
  closeOnClick = true,
  ...props
}: ItemProps) {
  const LinkComponent = useLinkComponent();
  const { content, accessibility } = useMenuItemContent({
    start,
    children,
    textValue,
    description,
    shortcut,
    end,
    'aria-describedby': ariaDescribedBy,
  });
  const itemClassName = classNames('env-menu-item', className);
  const followableDestination = href !== undefined && !disabled;
  if (followableDestination) {
    return (
      <BaseMenu.LinkItem
        {...props}
        className={itemClassName}
        closeOnClick
        onClick={onClick}
        // eslint-disable-next-line react-hooks/static-components
        render={<LinkComponent href={href} target={target} rel={rel} />}
        data-tone={tone}
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        {...accessibility}
      >
        {content}
      </BaseMenu.LinkItem>
    );
  }
  return (
    <BaseMenu.Item
      {...props}
      className={itemClassName}
      disabled={disabled}
      closeOnClick={href === undefined ? closeOnClick : true}
      onClick={href === undefined ? onClick : disabledDestinationFollowsNothing}
      data-tone={tone}
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      {...accessibility}
    >
      {content}
    </BaseMenu.Item>
  );
}
