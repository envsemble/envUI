'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useId, type AriaAttributes, type MouseEvent, type ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import { Kbd } from '../../content/Kbd.js';
import { useLinkComponent } from '../../internal/provider/LinkComponentContext.js';
import { keyShortcuts, shortcutChords } from '../internal/shortcuts.js';
import '../../styles/Base.css';
import '../../styles/Menu.css';

export interface ItemContentProps {
  /** A decorative icon before the label, such as Settings. */
  icon?: ReactNode;
  /** The item's label, which names it. */
  children: ReactNode;
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

/** Shared item layout: indicator, icon, label with optional description, end content, shortcut. */
export function useMenuItemContent(
  { icon, children, description, shortcut, end }: ItemContentProps,
  indicator?: ReactNode,
) {
  const descriptionId = useId();
  const chords = shortcut ? shortcutChords(shortcut) : [];
  const content = (
    <>
      {indicator}
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <span className="env-menu-item-text">
        <span className="env-menu-item-label">{children}</span>
        {description != null && (
          // Announced through aria-describedby rather than as part of the item's name.
          <span className="env-menu-item-description" id={descriptionId} aria-hidden="true">
            {description}
          </span>
        )}
      </span>
      {end != null && (
        <>
          {/* The space keeps the end content a separate word in the item's accessible name. */}{' '}
          <span className="env-menu-item-end">{end}</span>
        </>
      )}
      {chords.length > 0 && (
        // aria-keyshortcuts announces the shortcut; the keys show it.
        <span className="env-menu-item-shortcut" aria-hidden="true">
          {chords.map((keys, index) => (
            <Kbd key={index} keys={keys} />
          ))}
        </span>
      )}
    </>
  );
  return {
    content,
    accessibility: {
      'aria-describedby': description != null ? descriptionId : undefined,
      'aria-keyshortcuts': keyShortcuts(chords),
    },
  };
}

interface ItemSharedProps extends ItemContentProps {
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
      }
    | {
        href?: undefined;
        /** The action, run when the item is chosen; the menu then closes. */
        onClick?: (event: MouseEvent<HTMLElement>) => void;
        target?: never;
        rel?: never;
      }
  );

/** A disabled destination is no link, so a press follows nothing. */
const preventActivation = (event: MouseEvent<HTMLElement>) => event.preventDefault();

/**
 * One action (onClick) or destination (href) in a Menu. Destinations use the LinkProvider's link
 * and close the menu as they are followed.
 */
export function Item({
  icon,
  children,
  description,
  shortcut,
  end,
  tone = 'neutral',
  disabled,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
  className,
  ...props
}: ItemProps) {
  const LinkComponent = useLinkComponent();
  const { content, accessibility } = useMenuItemContent({
    icon,
    children,
    description,
    shortcut,
    end,
  });
  const itemClassName = classNames('env-menu-item', className);
  // A disabled destination renders no link: it stays in place, dimmed, and reports aria-disabled,
  // as a disabled action does.
  if (props.href !== undefined && !disabled) {
    return (
      <BaseMenu.LinkItem
        className={itemClassName}
        closeOnClick
        onClick={props.onClick}
        // The link component comes from LinkProvider and keeps its identity between renders.
        // eslint-disable-next-line react-hooks/static-components
        render={<LinkComponent href={props.href} target={props.target} rel={props.rel} />}
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
      className={itemClassName}
      disabled={disabled}
      onClick={props.href === undefined ? props.onClick : preventActivation}
      data-tone={tone}
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      {...accessibility}
    >
      {content}
    </BaseMenu.Item>
  );
}
