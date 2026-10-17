'use client';

import { useCallback, useRef, type ComponentPropsWithRef } from 'react';
import { Button, IconButton } from './Button.js';
import { Kbd } from '../content/Kbd.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { TooltipDescribesContext } from '../feedback/internal/TooltipPopup.js';
import { Search } from '../icons/Search.js';
import type { ControlSize } from '../foundations/Theme.js';
import type { PopupSide } from '../internal/PopupSurface.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import { formatShortcut, useApplePlatform, useShortcut } from '../internal/useShortcut.js';
import { searchTrigger } from '../foundations/messages/searchTrigger.js';
import { useSidebarRail } from '../navigation/internal/SidebarCompact.js';

export interface SearchTriggerProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  /**
   * The label, and the name of the icon-only trigger.
   * @default 'Search', or EnvUIProvider's messages.searchTrigger.label
   */
  label?: string;
  /**
   * The keyboard shortcut, shown as keys at the end and announced as aria-keyshortcuts: `mod+k`
   * is ⌘K on Apple platforms and Ctrl+K elsewhere. false shows and handles none.
   * @default 'mod+k'
   */
  shortcut?: string | false;
  /**
   * Press the trigger when the shortcut is pressed anywhere in the window, text fields included.
   * With several triggers listening for one shortcut, the most recently mounted one that is visible
   * and not behind a modal dialog takes it. A disabled trigger, or a key press that something else
   * already handled, such as an editor's own shortcut, leaves the key alone.
   * @default true
   */
  listen?: boolean;
  /**
   * Show only the search icon, in a ghost IconButton with the label and shortcut in a tooltip.
   * @default true inside a sidebar showing icons only, else false
   */
  iconOnly?: boolean;
  /**
   * The side of the trigger the icon-only tooltip opens on.
   * @default 'inline-end' inside a sidebar showing icons only, else 'bottom'
   */
  tooltipSide?: PopupSide;
  /**
   * The height, as on every control.
   * @default the container's control height, md unless the container sets another
   */
  size?: ControlSize;
  /** Fill the width of the container, such as at the top of a sidebar. */
  fullWidth?: boolean;
}

/**
 * The button that opens search or a command palette: a field-like button with its label and the
 * shortcut's keys, or a search icon alone. It presses itself when the shortcut is pressed, and the
 * application opens the search from onClick.
 */
export function SearchTrigger({
  label: ownLabel,
  shortcut = 'mod+k',
  listen = true,
  iconOnly: ownIconOnly,
  tooltipSide,
  size,
  fullWidth = false,
  className,
  ref,
  ...props
}: SearchTriggerProps) {
  const messages = useMessages('searchTrigger', searchTrigger);
  const label = ownLabel ?? messages.label;
  const inRail = useSidebarRail();
  const iconOnly = ownIconOnly ?? inRail;
  const apple = useApplePlatform();
  const display = shortcut ? formatShortcut(shortcut, apple) : undefined;
  const element = useRef<HTMLButtonElement | null>(null);
  const forward = useCallback(
    (node: HTMLButtonElement | null) => {
      element.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  // Search opens from a text field too, as people expect of Mod+K; an editor that handles the key
  // itself prevents its default, and the shortcut leaves it alone. A disabled trigger leaves the
  // key to the browser.
  useShortcut(listen && shortcut, () => element.current?.click(), {
    element,
    allowInEditable: true,
    enabled: !props.disabled,
  });
  if (iconOnly)
    return (
      // The tooltip shows the name and keys that aria-label and aria-keyshortcuts already announce,
      // so it doesn't describe the button too.
      <TooltipDescribesContext value={false}>
        <Tooltip
          side={tooltipSide ?? (inRail ? 'inline-end' : 'bottom')}
          content={
            display ? (
              <span className="env-search-trigger-tooltip">
                {label} <Kbd keys={display.keys} />
              </span>
            ) : (
              label
            )
          }
        >
          <IconButton
            {...props}
            ref={forward}
            variant="ghost"
            size={size}
            icon={<Search />}
            aria-label={label}
            aria-keyshortcuts={display?.ariaKeyShortcuts}
            className={classNames('env-search-trigger', className)}
            data-icon-only=""
          />
        </Tooltip>
      </TooltipDescribesContext>
    );
  return (
    <Button
      {...props}
      ref={forward}
      variant="secondary"
      size={size}
      fullWidth={fullWidth}
      startIcon={<Search />}
      aria-keyshortcuts={display?.ariaKeyShortcuts}
      className={classNames('env-search-trigger', className)}
    >
      <span className="env-search-trigger-label">{label}</span>
      {/* aria-keyshortcuts announces the shortcut; the keys show it. */}
      {display && (
        <Kbd keys={display.keys} className="env-search-trigger-shortcut" aria-hidden="true" />
      )}
    </Button>
  );
}
