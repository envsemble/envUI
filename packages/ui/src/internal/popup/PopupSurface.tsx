'use client';

import { DirectionProvider, useDirection } from '@base-ui/react/direction-provider';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentType,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Theme, useTheme } from '../../foundations/Theme.js';
import { classNames } from '../classNames.js';
import { ResetControlDefaults } from '../control/ControlDefaults.js';
import { useEnvUI, type Direction } from '../provider/EnvUIContext.js';
import { setRef } from '../react/setRef.js';
import { usePortalContainer } from '../provider/PortalContainerContext.js';
import { containedCollisionAvoidance, containedPopupStyle } from './containedOverlays.js';
import { inSkeleton, skeletonAttributes } from '../skeleton/skeleton.js';
import { computedDirection } from '../dom/direction.js';
import {
  closingFocusState,
  returnFocusAsItCloses,
  type ClosingFocus,
  type FocusTarget,
} from './closingFocus.js';
import '../../styles/Base.css';
import '../../styles/Popup.css';

/** A side of the anchor; inline-start and inline-end follow the text direction. */
export type PopupSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
/** How the popup lines up with the anchor along its side. */
export type PopupAlign = 'start' | 'center' | 'end';

interface OffsetData {
  side: PopupSide;
  align: PopupAlign;
  anchor: { width: number; height: number };
  positioner: { width: number; height: number };
}

type Anchor = Element | RefObject<Element | null> | { getBoundingClientRect(): DOMRect };

/**
 * The popup element's props that its owner passes on, such as its name, id, ref, style, data
 * attributes and handlers: a div's, which every Base UI popup renders, and Base UI's render. Its
 * class is PopupSurface's className.
 */
export type PopupElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'className'> & {
  render?: ReactElement | ((props: ComponentPropsWithRef<'div'>) => ReactElement);
  [attribute: `data-${string}`]: string | boolean | undefined;
};

interface PositionerProps {
  side?: PopupSide;
  align?: PopupAlign;
  sideOffset: number | ((data: OffsetData) => number);
  alignOffset?: number | ((data: OffsetData) => number);
  collisionPadding: number;
  collisionAvoidance?: typeof containedCollisionAvoidance;
  anchor?: Anchor;
  className: string;
  children: ReactNode;
}

interface PopupProps extends PopupElementProps {
  initialFocus?: FocusTarget;
  finalFocus?: FocusTarget;
  className: string;
  children: ReactNode;
}

/**
 * The parts of a Base UI popup: Portal, Positioner and Popup of Popover, Menu, ContextMenu, Select,
 * Combobox, Tooltip or PreviewCard.
 */
export interface PopupParts {
  Portal: ComponentType<{ container?: HTMLElement | null; children?: ReactNode }>;
  Positioner: ComponentType<PositionerProps>;
  Popup: ComponentType<PopupProps>;
}

export interface PopupSurfaceProps {
  /** The popup's Base UI parts, such as { Portal: Popover.Portal, Positioner: …, Popup: … }. */
  parts: PopupParts;
  /** The side of the anchor it opens on; it flips where the window has no room. */
  side?: PopupSide;
  /** How it lines up with the anchor along that side. */
  align?: PopupAlign;
  /** The gap to the anchor in px, or a function of the placement; 8 by default. */
  sideOffset?: number | ((data: OffsetData) => number);
  /** The shift along the side from where align puts it, in px, or a function of the placement; none by default. */
  alignOffset?: number | ((data: OffsetData) => number);
  /** The room it keeps from the window's edges, in px; 8 by default. */
  collisionPadding?: number;
  /** What it opens beside, where that isn't its trigger. */
  anchor?: Anchor;
  /**
   * The trigger, whose text direction the popup takes as it opens where it has no anchor, and
   * where focus returns as it starts to close, where focus can go there. An owner passes the ref it
   * gives its trigger: a popup opened by a pointer, a hover or code may open while focus is
   * elsewhere.
   */
  trigger?: RefObject<Element | null>;
  /** Where focus goes as it opens, where its Popup takes it. */
  initialFocus?: FocusTarget;
  /**
   * Where focus goes as it closes, where its Popup takes it. A function runs as the popup starts to
   * close, unless a press outside it closed it, and again once it has gone (closingFocus.ts).
   */
  finalFocus?: FocusTarget;
  /**
   * The text direction inside it, for its placement and keyboard: the nearest EnvUIProvider's,
   * else the direction at the anchor or the trigger as it opens; without either, at the focused
   * element.
   */
  dir?: Direction;
  /** How far it floats above the page: 1, 2 (the default, as menus and popovers) or 3. */
  elevation?: 1 | 2 | 3;
  /** The widest it grows, where its owner's style sheet reads it: md, 20 rem, or lg, 28 rem. */
  width?: 'md' | 'lg';
  /** The owner's popup class, such as env-popover, beside env-popup. */
  className?: string;
  /**
   * The layout primitive the popup element renders as, which lays out its content, such as
   * <Column gap={3} padding={5} />. A render in popupProps replaces it.
   */
  layout?: ReactElement;
  /** The owner's positioner class. */
  positionerClassName?: string;
  /** More props for the Popup part, such as aria-label, ref, render, style and handlers. */
  popupProps?: PopupElementProps;
  /**
   * Shows the content as a skeleton: the popup is the busy root and keeps focus, so people can
   * still close it, while its content is inert.
   */
  skeleton?: boolean;
  children?: ReactNode;
}

const baseUiOpeningFocusWindowMs = 500;

function anchorElement(anchor: Anchor | undefined): Element | null {
  if (!anchor) return null;
  if (anchor instanceof Element) return anchor;
  if ('current' in anchor) return anchor.current;
  return null;
}

function directionAt(anchor: Anchor | undefined, trigger: RefObject<Element | null> | undefined) {
  return computedDirection(
    anchorElement(anchor) ?? trigger?.current ?? document.activeElement ?? document.documentElement,
  );
}

function Directed({
  dir,
  anchor,
  trigger,
  children,
}: {
  dir: Direction | undefined;
  anchor: Anchor | undefined;
  trigger: RefObject<Element | null> | undefined;
  children: (direction: Direction | undefined) => ReactNode;
}) {
  const provided = useEnvUI().dir;
  const [directionAtOpening, setDirectionAtOpening] = useState(() =>
    dir || provided || typeof document === 'undefined' ? undefined : directionAt(anchor, trigger),
  );
  useLayoutEffect(
    function readAgainWhenAnchorOrTriggerChanges() {
      if (dir || provided) return;
      const next = directionAt(anchor, trigger);
      setDirectionAtOpening((current) => (current === next ? current : next));
    },
    [dir, provided, anchor, trigger],
  );
  const direction = dir ?? provided ?? directionAtOpening;
  const directionAroundUntilRead = useDirection();
  return (
    <DirectionProvider direction={direction ?? directionAroundUntilRead}>
      {children(direction)}
    </DirectionProvider>
  );
}

/**
 * One implementation of envUI's floating surfaces: a Base UI popup's Portal, a Theme that carries
 * the trigger's theme, contrast and scale into the portal, the Positioner and the Popup, with the
 * shared env-popup look and the text direction at its trigger. The defaults a toolbar or a field
 * gives its buttons stay outside: the popup's buttons take their own.
 *
 *   <PopupSurface parts={{ Portal: Popover.Portal, Positioner: Popover.Positioner,
 *     Popup: Popover.Popup }} trigger={triggerRef} className="env-popover" width="md">…</PopupSurface>
 */
export function PopupSurface({
  parts: { Portal, Positioner, Popup },
  side,
  align,
  sideOffset = 8,
  alignOffset,
  collisionPadding = 8,
  anchor,
  trigger,
  initialFocus,
  finalFocus,
  dir,
  elevation = 2,
  width,
  className,
  layout,
  positionerClassName,
  popupProps,
  skeleton = false,
  children,
}: PopupSurfaceProps) {
  const theme = useTheme();
  const { container, contained } = usePortalContainer();
  const { style: ownStyle, ref: ownRef, onFocusCapture: ownFocusCapture } = popupProps ?? {};
  const openedAt = useRef(0);
  const closingFocus = useRef<ClosingFocus>(closingFocusState());
  useLayoutEffect(() => {
    closingFocus.current.finalFocus = finalFocus;
    closingFocus.current.trigger = trigger;
  });
  const shownPopup = useRef<HTMLDivElement | null>(null);
  const attachPopup = useCallback(
    (node: HTMLDivElement) => {
      openedAt.current = performance.now();
      const mountedAfresh = node !== shownPopup.current;
      if (mountedAfresh) {
        closingFocus.current = {
          ...closingFocusState(),
          finalFocus: closingFocus.current.finalFocus,
          trigger: closingFocus.current.trigger,
        };
      }
      shownPopup.current = node;
      const ownCleanup = setRef(ownRef, node);
      const stop = returnFocusAsItCloses(node, closingFocus);
      return () => {
        stop();
        openedAt.current = 0;
        if (ownCleanup) ownCleanup();
        else setRef(ownRef, null);
      };
    },
    [ownRef],
  );
  const sendBackBaseUiOpeningFocus = (event: FocusEvent<HTMLDivElement>) => {
    ownFocusCapture?.(event);
    if (performance.now() - openedAt.current > baseUiOpeningFocusWindowMs) return;
    const from = event.relatedTarget;
    const own = [container, trigger?.current, anchorElement(anchor), event.currentTarget];
    if (from instanceof Node && own.some((element) => element?.contains(from))) return;
    if (from instanceof HTMLElement) from.focus({ preventScroll: true });
    else if (event.target instanceof HTMLElement) event.target.blur();
  };
  return (
    <Portal container={container}>
      <Directed dir={dir} anchor={anchor} trigger={trigger}>
        {(direction) => (
          <Theme {...theme} className="env-popup-theme" dir={direction}>
            <Positioner
              side={side}
              align={align}
              sideOffset={sideOffset}
              {...(alignOffset !== undefined && { alignOffset })}
              collisionPadding={collisionPadding}
              {...(contained && { collisionAvoidance: containedCollisionAvoidance })}
              {...(anchor !== undefined && { anchor })}
              className={classNames('env-popup-positioner', positionerClassName)}
            >
              <Popup
                {...(layout && { render: layout })}
                {...popupProps}
                ref={attachPopup}
                {...(contained && {
                  style: { ...containedPopupStyle, ...ownStyle },
                  onFocusCapture: sendBackBaseUiOpeningFocus,
                })}
                {...skeletonAttributes(skeleton)}
                {...(initialFocus !== undefined && { initialFocus })}
                {...(finalFocus !== undefined && { finalFocus })}
                className={classNames('env-popup', className)}
                data-elevation={elevation}
                data-width={width}
              >
                <ResetControlDefaults>{inSkeleton(skeleton, children)}</ResetControlDefaults>
              </Popup>
            </Positioner>
          </Theme>
        )}
      </Directed>
    </Portal>
  );
}
