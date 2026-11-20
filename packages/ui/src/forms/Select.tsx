'use client';

import {
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { useFieldMetadata } from '../internal/field/useFieldMetadata.js';
import { useRowControlNaming } from '../internal/field/rowControl.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { IconCheck } from '../icons/Check.js';
import {
  FieldFrame,
  FieldLabelContent,
  type FieldProps,
  type FieldSizeProps,
  type TextFieldDecorationProps,
} from '../internal/field/FieldFrame.js';
import { PopupSurface } from '../internal/popup/PopupSurface.js';
import { usePortalContainer } from '../internal/provider/PortalContainerContext.js';
import { containedModal, containedOpenChange } from '../internal/popup/containedOverlays.js';
import type { OverlayOpenChangeReason } from '../internal/popup/overlayOpenChangeReason.js';
import { Grid } from '../layout/Layout.js';
import { ListRow } from '../internal/popup/ListRow.js';
import { Slot } from '../internal/layout/Slot.js';
import { setRef } from '../internal/react/setRef.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { classNames } from '../internal/classNames.js';
import { useFormReset } from '../internal/field/useFormReset.js';
import '../styles/Base.css';
import '../styles/Select.css';

/** One option of a Select. */
export interface SelectItem {
  /** The value the select reports and a form submits when this option is chosen. */
  value: string;
  /** The option's name in the list and, once chosen, on the trigger; typing it jumps to the option. */
  label: string;
  /** A muted second line under the label in the list, such as why the option is unavailable. */
  description?: string;
  /**
   * Content before the label, in the list and, once chosen, on the trigger, such as a status dot,
   * a priority's icon, a flag or an Avatar, at its own size. It is hidden from assistive
   * technology: the label names the option.
   */
  start?: ReactNode;
  /** Content at the option's end in the list, such as a count or a Badge, which keeps its size. */
  end?: ReactNode;
  /** Show the option but don't let people choose it; the keyboard can still highlight it. */
  disabled?: boolean;
  /**
   * More props for the option's element, such as a title or data attributes for tests. Its class
   * joins the option's; the option's role, id and ARIA attributes stay its own.
   */
  itemProps?: SelectItemElementProps;
  /** Reserved: an entry with an `items` array is a group, so an option has none. */
  items?: never;
}
/** What a Select option's itemProps can set on its option element. */
export type SelectItemElementProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'id' | 'role' | 'tabIndex' | 'dangerouslySetInnerHTML' | `aria-${string}`
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };
/** Options of a Select under a heading, which also names the group for assistive technology. */
export interface SelectGroup {
  /** The group's heading: text, or content such as an icon or a count beside the group's name. */
  label: ReactNode;
  /** The options under the heading, in display order. */
  items: readonly SelectItem[];
}
/** What a select's onOpenChange receives beside the requested state. */
export interface SelectOpenChangeDetails {
  /** Why it asks to open or close, such as trigger-press, item-press or escape-key. */
  reason: Extract<
    OverlayOpenChangeReason,
    | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'window-resize'
    | 'item-press'
    | 'focus-out'
    | 'list-navigation'
    | 'cancel-open'
    | 'imperative-action'
    | 'none'
  >;
}

export interface SelectProps
  extends
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps,
    FieldSizeProps,
    Pick<TextFieldDecorationProps, 'visibleLabel'> {
  /** The trigger, the button that shows the chosen option and opens the list. */
  ref?: Ref<HTMLButtonElement>;
  /** The field's class, on its root element, beside env-field and env-select. */
  className?: string;
  /** Styles of the field's root element. */
  style?: CSSProperties;
  /**
   * The options of the list, in order, each with a value, a label, an optional description, start
   * and end content and whether it is disabled; or groups of options under headings.
   */
  items: readonly SelectItem[] | readonly SelectGroup[];
  /**
   * The chosen option's value in a controlled select, or null for none, which shows the
   * placeholder; update it from onValueChange.
   */
  value?: string | null;
  /**
   * The chosen option's value an uncontrolled select starts with; a native form reset returns to it.
   * Without it, nothing is chosen and the trigger shows the placeholder.
   */
  defaultValue?: string | null;
  /** Receives the value of the option people choose. */
  onValueChange?: (value: string | null) => void;
  /** Whether the list is open, for a select the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether the list of an uncontrolled select starts open, such as in a picture of the open list.
   * @default false
   */
  defaultOpen?: boolean;
  /** Receives the requested state, and why, each time the list asks to open or close. */
  onOpenChange?: (open: boolean, details: SelectOpenChangeDetails) => void;
  /**
   * People can read the chosen option, and a form submits it, but the list doesn't open.
   * @default false
   */
  readOnly?: boolean;
  /** Submits the chosen option's value with a form under this name, through a hidden input. */
  name?: string;
  /**
   * Require a choice before the form submits: the browser refuses the form and moves focus to the
   * trigger while nothing is chosen.
   * @default false
   */
  required?: boolean;
  /** What the trigger shows while nothing is chosen, such as Choose an owner. */
  placeholder?: string;
  /** A hint for the browser's autofill, such as country, set on the hidden input. */
  autoComplete?: string;
}

function PositionerBelowTrigger(props: ComponentProps<typeof BaseSelect.Positioner>) {
  return <BaseSelect.Positioner {...props} alignItemWithTrigger={false} />;
}

const popupParts = {
  Portal: BaseSelect.Portal,
  Positioner: PositionerBelowTrigger,
  Popup: BaseSelect.Popup,
};

function SelectOption({ item }: { item: SelectItem }) {
  const descriptionId = useId();
  return (
    <ListRow
      render={
        <BaseSelect.Item
          {...item.itemProps}
          value={item.value}
          label={item.label}
          disabled={item.disabled}
          aria-describedby={item.description ? descriptionId : undefined}
        />
      }
      className="env-select-item"
      start={item.start}
      end={item.end}
      indicator={
        <BaseSelect.ItemIndicator className="env-icon env-select-item-indicator">
          <IconCheck />
        </BaseSelect.ItemIndicator>
      }
      label={<BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>}
      description={
        item.description ? (
          <span id={descriptionId} aria-hidden="true">
            {item.description}
          </span>
        ) : undefined
      }
    />
  );
}

function isGroup(entry: SelectItem | SelectGroup): entry is SelectGroup {
  return Array.isArray(entry.items);
}

function optionsOf(items: readonly SelectItem[] | readonly SelectGroup[]) {
  return items.flatMap((entry: SelectItem | SelectGroup) =>
    isGroup(entry) ? entry.items : [entry],
  );
}

function cameFromKeyboard(event: Event | undefined) {
  const clickFromKeyOnButton = event?.type === 'click' && (event as MouseEvent).detail === 0;
  return event?.type.startsWith('key') === true || clickFromKeyOnButton;
}

function restoreOptionFocusBaseUiLostOnBusyPage(
  trigger: HTMLElement | null,
  list: HTMLElement | null,
) {
  const focusLeftOnTrigger = trigger !== null && trigger.ownerDocument.activeElement === trigger;
  if (!focusLeftOnTrigger) return;
  const options = list?.querySelectorAll<HTMLElement>('[role="option"]') ?? [];
  const option =
    Array.from(options).find((each) => each.hasAttribute('data-highlighted')) ??
    Array.from(options).find((each) => each.getAttribute('aria-selected') === 'true');
  option?.focus({ preventScroll: true });
}

function WidthOfLongestOption({ items }: { items: readonly SelectItem[] }) {
  return (
    <span className="env-select-sizer" aria-hidden="true">
      {items.map((item) => (
        <span key={item.value} data-label={item.label} />
      ))}
    </span>
  );
}

function ChosenStart({ options, value }: { options: readonly SelectItem[]; value: string | null }) {
  const start = options.find((option) => option.value === value)?.start;
  if (start == null) return null;
  return (
    <Slot className="env-select-value-start" element="span" layout="row" shrink="never" aria-hidden>
      {start}
    </Slot>
  );
}

/**
 * One choice from a list that stays collapsed until opened: an outlined field, as TextField is,
 * whose button shows the chosen option and opens a popup list, where a check mark shows the chosen
 * option, with its label inside, a description, an error and native form participation.
 */
export function Select({
  ref,
  items,
  value,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  readOnly = false,
  name,
  required,
  disabled,
  label,
  description,
  error,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  placeholder,
  autoComplete,
  size,
  visibleLabel,
  form,
  id: suppliedId,
  className,
  style,
  ...triggerProps
}: SelectProps) {
  const options = optionsOf(items);
  const naming = useRowControlNaming({ label, ...triggerProps, 'aria-describedby': describedBy });
  const metadata = useFieldMetadata(
    suppliedId,
    description,
    error,
    naming['aria-describedby'] ?? describedBy,
    invalid,
  );
  const { id } = metadata;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openedByKeyboard = useRef(false);
  const portal = usePortalContainer();
  const [selectedValue, changeValue, keepOwnValue] = useControllableState({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [open, setOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  useFormReset(
    inputRef,
    function applyReset() {
      const input = inputRef.current;
      const resetValue = keepOwnValue(defaultValue ?? null);
      if (input) input.value = resetValue ?? '';
    },
    form,
  );
  return (
    <BaseSelect.Root<string>
      items={options}
      value={selectedValue}
      onValueChange={(next) => changeValue(next)}
      open={open}
      readOnly={readOnly}
      onOpenChange={containedOpenChange(portal, triggerRef, (next, details) => {
        setOpen(next, { reason: details.reason });
        if (next) openedByKeyboard.current = cameFromKeyboard(details.event);
      })}
      onOpenChangeComplete={(open) => {
        if (open && openedByKeyboard.current)
          restoreOptionFocusBaseUiLostOnBusyPage(triggerRef.current, listRef.current);
      }}
      modal={containedModal(portal, true)}
      name={name}
      required={required}
      disabled={disabled}
      form={form}
      autoComplete={autoComplete}
      id={id}
      inputRef={inputRef}
    >
      <FieldFrame
        id={id}
        label={
          label != null ? (
            <BaseSelect.Label render={<label />} className="env-select-label">
              <FieldLabelContent>{label}</FieldLabelContent>
            </BaseSelect.Label>
          ) : null
        }
        description={description}
        error={error}
        controlBox
        size={size}
        visibleLabel={visibleLabel}
        className={classNames('env-select', className)}
        style={style}
        renderControlBox={(box) => (
          <div
            {...box}
            ref={controlRef}
            className={classNames(box.className, 'env-select-control')}
          />
        )}
      >
        <BaseSelect.Trigger
          {...triggerProps}
          {...naming}
          {...metadata}
          ref={(node: HTMLButtonElement | null) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          className="env-text-field-input env-select-trigger"
        >
          <ChosenStart options={options} value={selectedValue} />
          <BaseSelect.Value
            className="env-select-value"
            placeholder={<span className="env-select-placeholder">{placeholder ?? ' '}</span>}
          />
          <WidthOfLongestOption items={options} />
        </BaseSelect.Trigger>
        <span className="env-text-field-end env-select-end" aria-hidden="true">
          <span className="env-icon env-select-icon">
            <IconChevronRight />
          </span>
        </span>
        <PopupSurface
          parts={popupParts}
          side="bottom"
          align="start"
          trigger={controlRef}
          anchor={controlRef}
          className="env-select-popup"
          layout={<Grid padding={1} />}
        >
          <BaseSelect.List ref={listRef} render={<Grid />} className="env-select-list">
            {items.map((entry: SelectItem | SelectGroup, index) =>
              isGroup(entry) ? (
                <BaseSelect.Group key={index} render={<Grid />} className="env-select-group">
                  <BaseSelect.GroupLabel className="env-select-group-label">
                    {entry.label}
                  </BaseSelect.GroupLabel>
                  {entry.items.map((item) => (
                    <SelectOption key={item.value} item={item} />
                  ))}
                </BaseSelect.Group>
              ) : (
                <SelectOption key={entry.value} item={entry} />
              ),
            )}
          </BaseSelect.List>
        </PopupSurface>
      </FieldFrame>
    </BaseSelect.Root>
  );
}
