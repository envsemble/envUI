'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import {
  useLayoutEffect,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from 'react';
import { Theme, useTheme } from '../foundations/Theme.js';
import { classNames } from './classNames.js';
import { useEnvUI, type Direction } from './EnvUIContext.js';

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
  Portal: ComponentType<{ children?: ReactNode }>;
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
  /** Where focus goes as it opens, where its Popup takes it. */
  initialFocus?: FocusTarget;
  /** Where focus goes as it closes, where its Popup takes it. */
  finalFocus?: FocusTarget;
  /**
   * The text direction inside it, for its placement and keyboard: the nearest EnvUIProvider's,
   * else the direction at the anchor, or at the focused trigger, as it opens.
   */
  dir?: Direction;
  /** How far it floats above the page: 1, 2 (the default, as menus and popovers) or 3. */
  elevation?: 1 | 2 | 3;
  /** Its width: md, 20 rem, or lg, 28 rem, both narrowing to fit the window; its content's without. */
  width?: 'md' | 'lg';
  /** The owner's popup class, such as env-popover, beside env-popup. */
  className?: string;
  /** The owner's positioner class. */
  positionerClassName?: string;
  /** More props for the Popup part: aria-label, ref, render, data attributes and handlers. */
  popupProps?: Record<string, unknown>;
  children?: ReactNode;
}

/** The element an anchor stands for, if it is one. */
function anchorElement(anchor: Anchor | undefined): Element | null {
  if (!anchor) return null;
  if (anchor instanceof Element) return anchor;
  if ('current' in anchor) return anchor.current;
  return null;
}

/** The popup's content in a direction: the given one, the provider's, or the anchor's on opening. */
function Directed({
  dir,
  anchor,
  children,
}: {
  dir: Direction | undefined;
  anchor: Anchor | undefined;
  children: (direction: Direction | undefined) => ReactNode;
}) {
  const provided = useEnvUI().dir;
  const [read, setRead] = useState<Direction>();
  // It mounts as the popup opens, so the direction is read then, before the popup is painted.
  useLayoutEffect(() => {
    if (dir || provided) return;
    const source = anchorElement(anchor) ?? document.activeElement ?? document.documentElement;
    setRead(getComputedStyle(source).direction === 'rtl' ? 'rtl' : 'ltr');
  }, [dir, provided, anchor]);
  const direction = dir ?? provided ?? read;
  const content = children(direction);
  return direction ? (
    <DirectionProvider direction={direction}>{content}</DirectionProvider>
  ) : (
    content
  );
}

/**
 * One implementation of envUI's floating surfaces: a Base UI popup's Portal, a Theme that carries
 * the trigger's theme, contrast and scale into the portal, the Positioner and the Popup, with the
 * shared env-popup look and the text direction at its trigger.
 *
 *   <PopupSurface parts={{ Portal: Popover.Portal, Positioner: Popover.Positioner,
 *     Popup: Popover.Popup }} className="env-popover" width="md">…</PopupSurface>
 */
export function PopupSurface({
  parts: { Portal, Positioner, Popup },
  side,
  align,
  sideOffset = 8,
  alignOffset,
  collisionPadding = 8,
  anchor,
  initialFocus,
  finalFocus,
  dir,
  elevation = 2,
  width,
  className,
  positionerClassName,
  popupProps,
  children,
}: PopupSurfaceProps) {
  const theme = useTheme();
  return (
    <Portal>
      <Directed dir={dir} anchor={anchor}>
        {(direction) => (
          <Theme {...theme} className="env-popup-theme" dir={direction}>
            <Positioner
              side={side}
              align={align}
              sideOffset={sideOffset}
              {...(alignOffset !== undefined && { alignOffset })}
              collisionPadding={collisionPadding}
              {...(anchor !== undefined && { anchor })}
              className={classNames('env-popup-positioner', positionerClassName)}
            >
              <Popup
                {...popupProps}
                {...(initialFocus !== undefined && { initialFocus })}
                {...(finalFocus !== undefined && { finalFocus })}
                className={classNames('env-popup', className)}
                data-elevation={elevation}
                data-width={width}
              >
                {children}
              </Popup>
            </Positioner>
          </Theme>
        )}
      </Directed>
    </Portal>
  );
}
