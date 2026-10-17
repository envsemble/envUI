'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  cloneElement,
  useId,
  useLayoutEffect,
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

/** The control's own accessible name, where its props give one as text: a first guess. */
function ownName(props: TriggerProps): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  if (typeof props.label === 'string') return props.label;
  if (typeof props.children === 'string' || typeof props.children === 'number')
    return String(props.children);
  return undefined;
}

/**
 * An element's accessible name as the page has it: its aria-labelledby text, its aria-label, its
 * labels, or its text. Enough to tell whether a control is named, and by what words.
 */
function accessibleName(element: Element | null | undefined): string | undefined {
  if (!element) return undefined;
  const clean = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim() || undefined;
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = clean(
      labelledBy
        .split(/\s+/)
        .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
        .join(' '),
    );
    if (text) return text;
  }
  const label = clean(element.getAttribute('aria-label'));
  if (label) return label;
  const labels = (element as HTMLInputElement).labels;
  if (labels?.length) return clean(Array.from(labels, (each) => each.textContent).join(' '));
  return clean(element.textContent);
}

/** The role a control has: its role attribute, else its element's, for the common controls. */
function roleOf(element: Element | null | undefined): string | undefined {
  if (!element) return undefined;
  const role = element.getAttribute('role');
  if (role) return role.split(/\s+/)[0];
  const tag = element.tagName.toLowerCase();
  if (tag === 'button') return 'button';
  if (tag === 'a' || tag === 'area') return 'link';
  if (tag === 'select') return 'combobox';
  if (tag === 'textarea') return 'textbox';
  if (tag === 'input') {
    const type = (element as HTMLInputElement).type;
    if (type === 'checkbox' || type === 'radio') return type;
    if (type === 'range') return 'slider';
    if (['button', 'submit', 'reset', 'image'].includes(type)) return 'button';
    return 'textbox';
  }
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
  // The trigger's name, read from the page as the tooltip opens, so a control named by its
  // content, such as a Toolbar.Button or a button with an icon and text, counts as named.
  const [name, setName] = useState(() => ownName(trigger));
  // A disabled control's wrapper stands in for it: the control's name and role, read once it is
  // in the page.
  const [stand, setStand] = useState<{ name?: string; role?: string }>({});
  useLayoutEffect(() => {
    if (!isDisabled) return;
    const control = triggerRef.current?.firstElementChild;
    const next = { name: accessibleName(control) ?? ownName(trigger), role: roleOf(control) };
    setStand((current) =>
      current.name === next.name && current.role === next.role ? current : next,
    );
  }, [isDisabled, trigger]);
  const standsIn = isDisabled && stand.name !== undefined && stand.role !== undefined;
  const ownWords = isDisabled ? stand.name : name;
  // A control named by the same words needs no description that repeats them.
  const describes =
    ownWords !== undefined && !(typeof content === 'string' && content.trim() === ownWords);
  const describedBy =
    open && describes && (!isDisabled || standsIn)
      ? [trigger['aria-describedby'], popupId].filter(Boolean).join(' ')
      : trigger['aria-describedby'];
  return (
    // A control that becomes enabled or disabled changes the trigger element; a fresh tooltip
    // listens to the new one, so hovering it still opens the tooltip.
    <TooltipNestingContext value>
      <BaseTooltip.Root
        key={isDisabled ? 'disabled' : 'enabled'}
        open={open}
        onOpenChange={(next) => {
          if (next && !isDisabled) setName(accessibleName(triggerRef.current) ?? ownName(trigger));
          setOpen(next);
        }}
      >
        <BaseTooltip.Trigger
          ref={triggerRef}
          delay={delay}
          aria-describedby={describedBy}
          render={
            isDisabled ? (
              // Disabled controls receive no pointer or focus events, so the wrapper carries them.
              // It takes the control's place for assistive technology, with its role and name,
              // disabled, and a tab stop, where it can read both.
              <span
                className="env-tooltip-disabled-target"
                role={standsIn ? stand.role : undefined}
                aria-label={standsIn ? stand.name : undefined}
                aria-disabled={standsIn || undefined}
                tabIndex={standsIn ? 0 : undefined}
              />
            ) : (
              children
            )
          }
        >
          {isDisabled
            ? cloneElement(children, standsIn ? ({ 'aria-hidden': true } as object) : {})
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
