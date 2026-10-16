'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  cloneElement,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { TooltipNestingContext, TooltipPopup, type TooltipSide } from './internal/TooltipPopup.js';

/** The props of the control a Tooltip describes, as far as the tooltip reads them. */
interface TriggerProps {
  disabled?: boolean;
  children?: ReactNode;
  label?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface TooltipProps
  extends Omit<ComponentPropsWithRef<'div'>, 'content' | 'children' | 'title'> {
  /**
   * What the tooltip shows: a short, supplementary text, such as an icon-only control's name or
   * why a control is disabled. While it is open, a control with a name of its own is described by
   * it (aria-describedby); never the only place essential information appears.
   */
  content: ReactNode;
  /**
   * The one control it describes, such as an IconButton, which takes the trigger's props and ref.
   * A disabled control is wrapped in a focusable element that carries its name and reports it
   * disabled, so hovering and keyboard focus still open the tooltip.
   */
  children: ReactElement<TriggerProps>;
  /**
   * The side of the control it opens on: top, bottom, left, right, or inline-start and inline-end,
   * which follow the text direction. Where the window has no room, it flips to the other side.
   * @default 'top'
   */
  side?: TooltipSide;
  /**
   * Milliseconds the pointer rests on the control before the tooltip opens; keyboard focus opens it
   * at once.
   * @default 400
   */
  delay?: number;
}

/** The control's own accessible name, where its props give one as text. */
function ownName(props: TriggerProps): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  if (typeof props.label === 'string') return props.label;
  if (typeof props.children === 'string' || typeof props.children === 'number')
    return String(props.children);
  return undefined;
}

/**
 * A short label beside a control, shown while the pointer rests on it or it has keyboard focus,
 * such as an icon-only button's name or why a control is disabled. It closes on Esc and when the
 * control is pressed. className, style, ref and data attributes go to the tooltip's popup.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 400,
  ...popupProps
}: TooltipProps) {
  const trigger = children.props;
  const isDisabled = Boolean(trigger.disabled);
  const popupId = `${useId()}-tooltip`;
  const [open, setOpen] = useState(false);
  // The tooltip takes the text direction at its trigger, the control or its wrapper.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const name = ownName(trigger);
  const named = name !== undefined || Boolean(trigger['aria-labelledby']);
  // A control named by the same words needs no description that repeats them.
  const describes = named && !(typeof content === 'string' && content === name);
  const describedBy =
    open && describes
      ? [trigger['aria-describedby'], popupId].filter(Boolean).join(' ')
      : trigger['aria-describedby'];
  return (
    // A control that becomes enabled or disabled changes the trigger element; a fresh tooltip
    // listens to the new one, so hovering it still opens the tooltip.
    <TooltipNestingContext value>
      <BaseTooltip.Root
        key={isDisabled ? 'disabled' : 'enabled'}
        open={open}
        onOpenChange={(next) => setOpen(next)}
      >
        <BaseTooltip.Trigger
          ref={triggerRef}
          delay={delay}
          aria-describedby={describedBy}
          render={
            isDisabled ? (
              // Disabled controls receive no pointer or focus events, so the wrapper carries them.
              // It takes the control's place for assistive technology: its name, disabled, and a
              // tab stop only where it has a name to announce.
              <span
                className="env-tooltip-disabled-target"
                role={name === undefined ? undefined : 'button'}
                aria-label={name}
                aria-disabled={name === undefined ? undefined : true}
                tabIndex={name === undefined ? undefined : 0}
              />
            ) : (
              children
            )
          }
        >
          {isDisabled
            ? cloneElement(children, name === undefined ? {} : ({ 'aria-hidden': true } as object))
            : undefined}
        </BaseTooltip.Trigger>
        <TooltipPopup
          content={content}
          side={side}
          trigger={triggerRef}
          popupProps={{ ...popupProps, id: popupId }}
        />
      </BaseTooltip.Root>
    </TooltipNestingContext>
  );
}
