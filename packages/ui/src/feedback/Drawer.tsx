'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import {
  useLayoutEffect,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { CloseButton } from '../actions/CloseButton.js';
import { classNames } from '../internal/classNames.js';
import { useEnvUI, useMessages, type Direction } from '../internal/EnvUIContext.js';
import { dialog } from '../foundations/messages/dialog.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import type {
  DialogFocusTarget,
  DialogOpenChangeDetails,
  DialogOpenChangeReason,
} from './Dialog.js';
import {
  DialogActions,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogSurface,
} from './internal/DialogParts.js';

export interface DrawerProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children' | 'defaultValue'> {
  /** Whether the drawer is open, for a drawer the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether a drawer the application doesn't control is open on the first render.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the requested state, and why, when the drawer asks to open or close: from the
   * trigger, Escape, an outside press, the close button, a swipe toward its edge or a DialogClose.
   * Not called for a dismissal that pending blocks.
   */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /**
   * The element that opens the drawer, such as a Button. It reports the drawer it opens, and focus
   * returns to it on close. Omit it for a drawer the application opens with open.
   */
  trigger?: ReactElement;
  /**
   * The edge of the window the drawer slides in from: start, the left in left-to-right text, or
   * end, the right. It follows the text direction, so it is mirrored in right-to-left text.
   * @default 'end'
   */
  side?: 'start' | 'end';
  /**
   * The drawer's heading and accessible name, such as Filters. Without one, name the drawer with
   * aria-label, as a navigation drawer does.
   */
  title?: ReactNode;
  /** The drawer's accessible name where it has no visible title. */
  'aria-label'?: string;
  /** Muted text under the title that describes the drawer to assistive technology too. */
  description?: ReactNode;
  /** The content under the heading, such as filters, details or navigation. It scrolls. */
  children?: ReactNode;
  /** Actions at the end of the content, such as Apply, with the primary action last. */
  actions?: ReactNode;
  /**
   * Whether the drawer shows its close button, a CloseButton at the end of the heading. Leave it
   * out only where the drawer holds a control that closes it, such as a sidebar's own toggle.
   * @default true
   */
  closeButton?: boolean;
  /**
   * The close button's name.
   * @default 'Close', or EnvUIProvider's messages.dialog.close
   */
  closeLabel?: string;
  /**
   * md, 24 rem, for details and filters; lg, 44 rem, for content-heavy panels such as tables and
   * comparisons; or any CSS length, such as min(20rem, 100vw - 2rem). md and lg take the whole
   * width of a window too narrow to leave the page beside them.
   * @default 'md'
   */
  width?: 'md' | 'lg' | (string & {});
  /**
   * true traps focus in the drawer over a backdrop, hides the page from assistive technology,
   * blocks presses on it and locks its scroll. false leaves the page usable beside the drawer, for
   * an inspector; it then closes when focus or a press goes outside it, unless
   * disablePointerDismissal.
   * @default true
   */
  modal?: boolean;
  /**
   * Keep the drawer open on presses outside it, and a non-modal drawer also when focus moves
   * outside, such as an inspector beside the page it inspects. Escape and the close buttons still
   * close it.
   * @default false
   */
  disablePointerDismissal?: boolean;
  /**
   * The element to focus when the drawer opens, as a ref or a function of how it was opened. By
   * default focus moves to the first focusable element inside, or to the drawer when opened by
   * touch.
   */
  initialFocus?: DialogFocusTarget;
  /**
   * The element to focus when the drawer closes, as a ref or a function of how it closed, such as
   * the main content after a navigation. By default focus returns to the trigger, or to the element
   * that had focus when it opened.
   */
  finalFocus?: DialogFocusTarget;
  /**
   * Work started from the drawer is in progress: Escape, outside presses, swipes and the close
   * button cannot dismiss it until pending returns to false, and the drawer reports busy.
   * @default false
   */
  pending?: boolean;
}

/** The text direction at the element that has focus as the drawer opens, or the document's. */
function readDirection(): Direction {
  if (typeof document === 'undefined') return 'ltr';
  const source = document.activeElement ?? document.documentElement;
  return getComputedStyle(source).direction === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * A panel that slides in from the start or end edge of the window over the page, for filters,
 * details, an inspector or a phone's navigation: a modal by default, which traps focus and returns
 * it on close, or beside the page with modal false. It takes the whole width of a narrow window,
 * and a swipe toward its edge closes it. className, style, ref and data attributes go to the
 * drawer's surface.
 */
export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  side = 'end',
  title,
  'aria-label': label,
  description,
  children,
  actions,
  closeButton = true,
  closeLabel: ownCloseLabel,
  width = 'md',
  modal = true,
  disablePointerDismissal = false,
  initialFocus,
  finalFocus,
  pending = false,
  className,
  style,
  ...popupProps
}: DrawerProps) {
  const theme = useTheme();
  const messages = useMessages('dialog', dialog);
  const provided = useEnvUI().dir;
  // The swipe that closes the drawer runs toward its edge, which is physical, so it follows the
  // direction where the drawer opens: the provider's, else the focused element's.
  const [read, setRead] = useState<Direction>();
  const direction = provided ?? read ?? 'ltr';
  // A drawer the application opens is read as it opens, too.
  useLayoutEffect(() => {
    if (open && !provided) setRead(readDirection());
  }, [open, provided]);
  const towardEnd = (side === 'end') === (direction === 'ltr');
  const named = width === 'md' || width === 'lg';
  return (
    <BaseDrawer.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, eventDetails) => {
        if (!next && pending) {
          eventDetails.cancel();
          return;
        }
        if (next && !provided) setRead(readDirection());
        onOpenChange?.(next, { reason: eventDetails.reason as DialogOpenChangeReason });
      }}
      modal={modal}
      disablePointerDismissal={disablePointerDismissal}
      swipeDirection={towardEnd ? 'right' : 'left'}
    >
      {trigger && <BaseDrawer.Trigger render={trigger} />}
      <BaseDrawer.Portal>
        <Theme {...theme} dir={provided ?? read}>
          {modal && <DialogBackdrop className="env-drawer-backdrop" />}
          <BaseDrawer.Viewport className="env-drawer-viewport" data-side={side}>
            <BaseDrawer.Popup
              render={<DialogSurface radius="none" />}
              {...popupProps}
              className={classNames('env-drawer-popup', className)}
              style={{ ...(!named && { '--env-drawer-width': width }), ...style } as CSSProperties}
              data-side={side}
              data-width={named ? width : 'custom'}
              aria-label={title == null ? label : undefined}
              aria-busy={pending || undefined}
              initialFocus={initialFocus}
              finalFocus={finalFocus}
            >
              <DialogContent>
                <DialogHeader
                  title={title}
                  description={description}
                  close={
                    closeButton ? (
                      <BaseDrawer.Close
                        render={
                          <CloseButton
                            aria-label={ownCloseLabel ?? messages.close}
                            disabled={pending}
                          />
                        }
                      />
                    ) : undefined
                  }
                />
                {children}
                {actions != null && <DialogActions>{actions}</DialogActions>}
              </DialogContent>
            </BaseDrawer.Popup>
          </BaseDrawer.Viewport>
        </Theme>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}
