'use client';

import type { SkeletonProps } from '../internal/skeleton.js';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { IconButton } from '../actions/Button.js';
import { Column } from '../layout/Layout.js';
import { IconClose } from '../icons/Close.js';
import { classNames } from '../internal/classNames.js';
import { markTriggerOwner } from '../internal/popup/triggerOwner.js';
import { setRef } from '../internal/react/setRef.js';
import { useEnvUI, useMessages, type Direction } from '../internal/provider/EnvUIContext.js';
import { dialog } from '../foundations/messages/dialog.js';
import { useTheme } from '../foundations/Theme.js';
import type { DialogFocusTarget, DialogOpenChangeDetails } from './Dialog.js';
import {
  DialogActions,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogPendingContext,
  DialogSurface,
  OverlayTheme,
} from '../internal/popup/DialogParts.js';
import { withPendingAction } from './internal/DialogPendingAction.js';
import { ResetControlDefaults } from '../internal/control/ControlDefaults.js';
import { ResizeHandle } from '../internal/resize/ResizeHandle.js';
import { useResizableWidth, widthInRem } from '../internal/resize/useResizableWidth.js';
import {
  containedModal,
  containedOpenChange,
  usePortalContainer,
} from '../internal/popup/PortalContainerContext.js';
import { computedDirection } from '../internal/dom/direction.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import type { ResizeDetails } from '../internal/resize/resizeDetails.js';
import { flag } from '../internal/flag.js';
import { useOpenState } from '../internal/popup/useOpenState.js';
import '../styles/Base.css';
import '../styles/Sheet.css';

export interface SheetProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children' | 'defaultValue'>, SkeletonProps {
  /** Whether the sheet is open, for a sheet the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether a sheet the application doesn't control is open on the first render.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the requested state, and why, when the sheet asks to open or close: from the
   * trigger, Escape, an outside press, the close button, a swipe of a finger toward its edge or a
   * DialogClose.
   * Not called for a dismissal that pending blocks.
   */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /**
   * The element that opens the sheet, such as a Button. It reports the sheet it opens, and focus
   * returns to it on close. Omit it for a sheet the application opens with open.
   */
  trigger?: ReactElement;
  /**
   * The edge of the window the sheet slides in from: end, the right in left-to-right text, or
   * start, the left, as a side sheet as tall as the window; or bottom, as a bottom sheet as wide
   * as the window up to 40 rem and as tall as its content. start and end follow the text
   * direction, so they are mirrored in right-to-left text.
   * @default 'end'
   */
  side?: SheetSide;
  /**
   * The sheet's heading and accessible name, such as Filters. Without one, name the sheet with
   * aria-label.
   */
  title?: ReactNode;
  /** The sheet's accessible name where it has no visible title. */
  'aria-label'?: string;
  /** Muted text under the title that describes the sheet to assistive technology too. */
  description?: ReactNode;
  /** The content under the heading, such as filters, details or choices. It scrolls. */
  children?: ReactNode;
  /**
   * Actions at the end of the content, such as Apply, with the primary action last. While the sheet
   * is pending, the last one shows it, where it is a Button that sets no pending of its own.
   */
  actions?: ReactNode;
  /**
   * Whether the sheet shows its close button, an IconButton with a cross at the end of the heading. Leave it
   * out only where the sheet holds another control that closes it.
   * @default true
   */
  closeButton?: boolean;
  /**
   * The close button's name.
   * @default 'Close', or EnvUIProvider's messages.dialog.close
   */
  closeLabel?: string;
  /**
   * A side sheet's width: md, 24 rem, for details and filters; lg, 44 rem, for content-heavy
   * panels such as tables and comparisons; or any CSS length, such as min(20rem, 100% - 2rem). md
   * takes the whole width of a compact window, lg of a compact or medium one, where the page
   * beside it would be a sliver. A number is a width in rem: with `resizable`, the width the
   * application controls with onWidthChange, while a CSS length is ignored, and warned of while
   * developing: the sheet starts at `defaultWidth`. A bottom sheet ignores it.
   * @default 'md'
   */
  width?: 'md' | 'lg' | number | (string & {});
  /**
   * Lets people resize a side sheet by its inner edge, the one toward the page: a handle there that
   * the pointer drags and the arrow keys move, between `minWidth` and `maxWidth` and never wider
   * than the window, which a double click returns to `defaultWidth`. The sheet is then as wide as
   * it at every window width. A bottom sheet ignores it.
   * @default false
   */
  resizable?: boolean;
  /**
   * The width in rem a `resizable` side sheet starts at until people resize it, and that a double
   * click on the handle returns it to.
   * @default 24, or 44 where width is lg
   */
  defaultWidth?: number;
  /**
   * Receives each new width of a `resizable` side sheet, in rem: while dragging with committed
   * false, and with committed true as a drag ends, a key moves the handle or a double click resets
   * it. Store the committed width to keep it, and pass it back as `width`.
   */
  onWidthChange?: (width: number, details: ResizeDetails) => void;
  /**
   * The smallest width of a `resizable` side sheet, in rem.
   * @default 16
   */
  minWidth?: number;
  /**
   * The largest width of a `resizable` side sheet, in rem; it never takes more than the window.
   * @default 60
   */
  maxWidth?: number;
  /**
   * The resize handle's name.
   * @default 'Resize', or EnvUIProvider's messages.dialog.resize
   */
  resizeLabel?: string;
  /**
   * true traps focus in the sheet over a backdrop, hides the page from assistive technology,
   * blocks presses on it and locks its scroll. false leaves the page usable beside the sheet, for
   * an inspector; it then closes when focus or a press goes outside it, unless
   * disablePointerDismissal.
   * @default true
   */
  modal?: boolean;
  /**
   * Keep the sheet open on presses outside it, and a non-modal sheet also when focus moves
   * outside, such as an inspector beside the page it inspects. Escape and the close buttons still
   * close it.
   * @default false
   */
  disablePointerDismissal?: boolean;
  /**
   * The element to focus when the sheet opens, as a ref or a function of how it was opened. By
   * default focus moves to the first element inside that takes Tab, such as the close button, or
   * to the sheet itself when opened by touch or when nothing inside takes focus.
   */
  initialFocus?: DialogFocusTarget;
  /**
   * The element to focus when the sheet closes, as a ref or a function of how it closed, such as
   * the main content after a navigation. By default focus returns to the trigger, or to the element
   * that had focus when it opened.
   */
  finalFocus?: DialogFocusTarget;
  /**
   * Work started from the sheet is in progress: Escape, outside presses, swipes and the close
   * button cannot dismiss it until pending returns to false. The close button and every DialogClose
   * inside are disabled, the primary action, the last of actions, shows it pending, and the sheet
   * reports busy.
   * @default false
   */
  pending?: boolean;
}

/** The edge a Sheet slides in from: the end or the start edge, or the bottom. */
export type SheetSide = 'bottom' | 'start' | 'end';

/** The text direction at an element: its trigger's, else the focused element's or the document's. */
function readDirection(source: Element | null): Direction {
  if (typeof document === 'undefined') return 'ltr';
  const element = source ?? document.activeElement ?? document.documentElement;
  return computedDirection(element);
}

/** Base UI's mark on an element that no swipe starts from: a drag on the handle resizes, by touch too. */
const noSwipe = { 'data-base-ui-swipe-ignore': '' };

/**
 * Says while developing that a resizable side sheet ignores a CSS length as its width, once a page:
 * its width is a number of rem then, which it starts at.
 */
function reportCssWidth(width: string) {
  reportInDevelopment(
    () =>
      process.env.NODE_ENV !== 'production' &&
      `a resizable Sheet ignores width="${width}": its width is a number of rem. ` +
        'Pass defaultWidth, or width as a number with onWidthChange, and minWidth and maxWidth.',
    { level: 'warn', key: 'Sheet width' },
  );
}

/** The widest a resizable sheet can be, in rem: its viewport's width, the window's. */
const roomFor = (handle: HTMLElement) => {
  const viewport = handle.closest('.env-sheet-viewport');
  return viewport ? widthInRem(viewport) : Infinity;
};

/**
 * A sheet's width: md or lg by name, else a length as its custom width; a resizable side sheet's in
 * rem, which its handle changes.
 */
function useSheetWidth({
  side,
  width,
  resizable: resizableOption,
  defaultWidth,
  onWidthChange,
  minWidth,
  maxWidth,
  widthText,
}: Required<Pick<SheetProps, 'width' | 'resizable' | 'minWidth' | 'maxWidth'>> &
  Pick<SheetProps, 'defaultWidth' | 'onWidthChange'> & {
    side: SheetSide;
    widthText: (width: string) => string;
  }) {
  const named = width === 'md' || width === 'lg';
  // A bottom sheet is as tall as its content and as wide as the window, so only a side sheet
  // resizes: its width in rem, the application's where width is a number.
  const resizable = resizableOption && side !== 'bottom';
  const cssWidth = resizable && typeof width === 'string' && !named ? width : undefined;
  useEffect(() => {
    if (cssWidth !== undefined) reportCssWidth(cssWidth);
  }, [cssWidth]);
  const resize = useResizableWidth({
    width: typeof width === 'number' ? width : undefined,
    defaultWidth: defaultWidth ?? (width === 'lg' ? 44 : 24),
    minWidth,
    maxWidth,
    onWidthChange,
    room: roomFor,
    // A sheet at the end grows as its inner edge, its start, moves toward the start.
    reverse: side === 'end',
    widthText,
  });
  const customWidth = resizable
    ? `${resize.width}rem`
    : typeof width === 'number'
      ? `${width}rem`
      : named
        ? undefined
        : width;
  return { named, resizable, resize, customWidth };
}

/**
 * A panel that slides in over the page from an edge of the window, for filters, details, an
 * inspector or choices: a side sheet from the end or the start edge, or a bottom sheet. It is a
 * modal by default, which traps focus and returns it on close, or beside the page with modal
 * false. A side sheet takes the whole width of a compact window, and a finger's swipe toward its
 * edge closes it; a mouse or a pen never swipes it. With `resizable`, people resize it by its inner
 * edge, with the same handle as between Panes. className, style, ref and data attributes go to the sheet's surface.
 */
export function Sheet({
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
  resizable: resizableProp = false,
  defaultWidth,
  onWidthChange,
  minWidth = 16,
  maxWidth = 60,
  resizeLabel,
  modal = true,
  disablePointerDismissal = false,
  initialFocus,
  finalFocus,
  pending = false,
  skeleton = false,
  className,
  style,
  ref,
  ...popupProps
}: SheetProps) {
  const theme = useTheme();
  const messages = useMessages('dialog', dialog);
  const provided = useEnvUI().dir;
  // Whether it shows, also where the application doesn't control it.
  const [shown, setShown] = useOpenState({ open, defaultOpen, onOpenChange });
  // The touch swipe that closes a side sheet runs toward its edge, which is physical, so it follows the
  // direction where the sheet opens: the provider's, else its trigger's, read as it opens.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [read, setRead] = useState<Direction>();
  const direction = provided ?? read ?? 'ltr';
  useLayoutEffect(() => {
    if (shown && !provided) setRead(readDirection(triggerRef.current));
  }, [shown, provided]);
  // By keyboard or mouse, focus moves to the first element that takes Tab, as in a dialog (true:
  // Base UI's own tabbable order, which knows radio groups and inert content), else the sheet. By
  // touch, to the sheet itself, so a field first inside doesn't open the on-screen keyboard.
  const popup = useRef<HTMLDivElement | null>(null);
  const attachPopup = useCallback(
    (element: HTMLDivElement | null) => {
      popup.current = element;
      return setRef(ref, element);
    },
    [ref],
  );
  const defaultFocus = useCallback(
    (interaction: string) => (interaction === 'touch' ? (popup.current ?? true) : true),
    [],
  );
  const towardEnd = (side === 'end') === (direction === 'ltr');
  const swipeDirection = side === 'bottom' ? 'down' : towardEnd ? 'right' : 'left';
  const { named, resizable, resize, customWidth } = useSheetWidth({
    side,
    width,
    resizable: resizableProp,
    defaultWidth,
    onWidthChange,
    minWidth,
    maxWidth,
    widthText: (value) => messages.width({ width: value }),
  });
  const portal = usePortalContainer();
  return (
    <BaseDrawer.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={containedOpenChange(portal, triggerRef, (next, eventDetails) => {
        if (!next && pending) eventDetails.cancel();
        else setShown(next, { reason: eventDetails.reason });
      })}
      modal={containedModal(portal, modal)}
      disablePointerDismissal={disablePointerDismissal}
      swipeDirection={swipeDirection}
    >
      {trigger && <BaseDrawer.Trigger ref={triggerRef} render={trigger} />}
      <BaseDrawer.Portal container={portal.container}>
        <OverlayTheme {...theme} dir={provided ?? read}>
          <ResetControlDefaults>
            {modal && <DialogBackdrop className="env-sheet-backdrop" />}
            <BaseDrawer.Viewport className="env-sheet-viewport" data-side={side}>
              <BaseDrawer.Popup
                // The whole sheet is Base UI's drawer content, where a mouse or a pen selects text
                // and never swipes: only a finger swipes the sheet closed, as on a phone.
                render={
                  <BaseDrawer.Content
                    render={<DialogSurface radius={side === 'bottom' ? undefined : 'none'} />}
                  />
                }
                {...popupProps}
                ref={attachPopup}
                className={classNames('env-sheet', className)}
                style={{
                  ...(customWidth !== undefined && { '--env-sheet-width': customWidth }),
                  ...style,
                }}
                data-side={side}
                data-width={named ? width : 'custom'}
                data-resizable={flag(resizable)}
                aria-label={title == null ? label : undefined}
                aria-busy={pending || skeleton || undefined}
                data-env-skeleton={flag(skeleton)}
                initialFocus={portal.contained ? false : (initialFocus ?? defaultFocus)}
                finalFocus={portal.contained ? false : finalFocus}
              >
                <DialogPendingContext.Provider value={pending}>
                  <DialogContent skeleton={skeleton}>
                    <DialogHeader
                      title={title}
                      description={description}
                      close={
                        closeButton ? (
                          <BaseDrawer.Close
                            render={
                              <IconButton
                                variant="ghost"
                                icon={<IconClose />}
                                aria-label={ownCloseLabel ?? messages.close}
                                disabled={pending}
                              />
                            }
                          />
                        ) : undefined
                      }
                    />
                    {/* The body scrolls on its own, so the heading and the actions stay in view in
                      a sheet too short for all it holds. */}
                    {children != null && (
                      <Column gap={5} className="env-sheet-body">
                        {children}
                      </Column>
                    )}
                    {actions != null && (
                      <DialogActions>{withPendingAction(actions, pending)}</DialogActions>
                    )}
                    {resizable && (
                      // On the content, which runs the sheet's full height, so the handle stays as
                      // tall as the sheet; the handle reaches out to the edge.
                      // A drag on it resizes rather than swipes the sheet closed, by touch too.
                      <ResizeHandle
                        {...resize.handleProps}
                        label={resizeLabel ?? messages.resize}
                        grip
                        className="env-sheet-resize-handle"
                        {...noSwipe}
                      />
                    )}
                  </DialogContent>
                </DialogPendingContext.Provider>
              </BaseDrawer.Popup>
            </BaseDrawer.Viewport>
          </ResetControlDefaults>
        </OverlayTheme>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

markTriggerOwner(Sheet);
