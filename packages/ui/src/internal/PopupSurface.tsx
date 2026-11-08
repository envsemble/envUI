'use client';

import { DirectionProvider, useDirection } from '@base-ui/react/direction-provider';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type Ref,
  type ComponentType,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Theme, useTheme } from '../foundations/Theme.js';
import { classNames } from './classNames.js';
import { ResetControlDefaults } from './ControlDefaults.js';
import { useEnvUI, type Direction } from './EnvUIContext.js';
import { setRef } from './setRef.js';
import {
  containedCollisionAvoidance,
  containedPopupStyle,
  usePortalContainer,
} from './PortalContainerContext.js';
import { inSkeleton, skeletonAttributes } from './skeleton.js';
import { computedDirection } from './direction.js';
import '../styles/Base.css';
import '../styles/Popup.css';

/** A side of the anchor; inline-start and inline-end follow the text direction. */
export type PopupSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
/** How the popup lines up with the anchor along its side. */
export type PopupAlign = 'start' | 'center' | 'end';

/** What Base UI's offset functions receive. */
interface OffsetData {
  side: PopupSide;
  align: PopupAlign;
  anchor: { width: number; height: number };
  positioner: { width: number; height: number };
}

/** An element, a ref to one, or Base UI's virtual element, for a popup that opens away from its trigger. */
type Anchor = Element | RefObject<Element | null> | { getBoundingClientRect(): DOMRect };

/** Where focus goes as the popup opens or closes, as Base UI's popups take it. */
type FocusTarget = boolean | RefObject<HTMLElement | null> | ((type: string) => unknown);

/**
 * The parts of a Base UI popup: Portal, Positioner and Popup of Popover, Menu, Select, Combobox,
 * Tooltip or PreviewCard.
 */
export interface PopupParts {
  Portal: ComponentType<{ container?: HTMLElement | null; children?: ReactNode }>;
  // Each Base UI positioner takes more than the props PopupSurface passes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Positioner: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Popup: ComponentType<any>;
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
   * The trigger, whose text direction the popup takes as it opens where it has no anchor. An owner
   * passes the ref it gives its trigger: a popup opened by a pointer, a hover or code may open
   * while focus is elsewhere.
   */
  trigger?: RefObject<Element | null>;
  /** Where focus goes as it opens, where its Popup takes it. */
  initialFocus?: FocusTarget;
  /** Where focus goes as it closes, where its Popup takes it. */
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
  /** More props for the Popup part: aria-label, ref, render, data attributes and handlers. */
  popupProps?: Record<string, unknown>;
  /**
   * Shows the content as a skeleton: the popup is the busy root and keeps focus, so people can
   * still close it, while its content is inert.
   */
  skeleton?: boolean;
  children?: ReactNode;
}

/** The element an anchor stands for, if it is one. */
function anchorElement(anchor: Anchor | undefined): Element | null {
  if (!anchor) return null;
  if (anchor instanceof Element) return anchor;
  if ('current' in anchor) return anchor.current;
  return null;
}

/**
 * The popup's content in a direction: the given one, the provider's, or else the anchor's or the
 * trigger's on opening.
 */
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
  const [read, setRead] = useState<Direction>();
  // It mounts as the popup opens, so the direction is read then, before the popup is painted.
  useLayoutEffect(() => {
    if (dir || provided) return;
    const source =
      anchorElement(anchor) ??
      trigger?.current ??
      document.activeElement ??
      document.documentElement;
    setRead(computedDirection(source));
  }, [dir, provided, anchor, trigger]);
  const direction = dir ?? provided ?? read;
  // The provider is always there, so the popup isn't remounted once the direction is read: a
  // remounted popup returns focus to where it was before opening, and a menu closes as it opens.
  // Until then it passes on the direction around it.
  const inherited = useDirection();
  return (
    <DirectionProvider direction={direction ?? inherited}>{children(direction)}</DirectionProvider>
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
  // popupProps are the popup's props, loosely typed for each popup that passes them.
  const ownStyle = popupProps?.style as CSSProperties | undefined;
  const ownRef = popupProps?.ref as Ref<HTMLElement> | undefined;
  const ownFocusCapture = popupProps?.onFocusCapture as
    ((event: FocusEvent<HTMLElement>) => void) | undefined;
  // When the popup appeared, to tell the focus Base UI moves into it as it opens.
  const openedAt = useRef(0);
  const attachPopup = useCallback(
    (node: HTMLElement | null) => {
      openedAt.current = node ? performance.now() : 0;
      setRef(ownRef, node);
    },
    [ownRef],
  );
  /**
   * In a contained container a popup takes no focus as it opens, such as a menu open from the
   * start: focus that arrives in its first moments from outside the container and the trigger goes
   * back where it was. Focus from the trigger, or that people move in later, stays.
   */
  const keepFocusOut = (event: FocusEvent<HTMLElement>) => {
    ownFocusCapture?.(event);
    if (performance.now() - openedAt.current > 500) return;
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
                {...(contained && {
                  style: { ...containedPopupStyle, ...ownStyle },
                  ref: attachPopup,
                  onFocusCapture: keepFocusOut,
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
