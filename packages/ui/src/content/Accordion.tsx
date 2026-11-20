'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { createContext, useContext, type ComponentPropsWithRef, type ReactNode } from 'react';
import { IconAdd } from '../icons/Add.js';
import { IconRemove } from '../icons/Remove.js';
import { classNames } from '../internal/classNames.js';
import { Slot } from '../internal/layout/Slot.js';
import {
  inSkeleton,
  given,
  skeletonAttributes,
  type SkeletonProps,
} from '../internal/skeleton/skeleton.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import '../styles/Base.css';
import '../styles/Accordion.css';

interface AccordionLook {
  headingLevel: Exclude<HeadingLevel, 1>;
  indicator: ReactNode;
  indicatorPlacement: 'start' | 'end';
}

const AccordionLookContext = createContext<AccordionLook>({
  headingLevel: 3,
  indicator: undefined,
  indicatorPlacement: 'start',
});

const asBaseUiMutableList = (values: readonly string[] | undefined) =>
  values as string[] | undefined;

export interface RootProps
  extends Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange'>, SkeletonProps {
  /** The items: Accordion.Item, one for each section. */
  children?: ReactNode;
  /**
   * The values of the open items, for a controlled accordion: update it from onValueChange. Use
   * defaultValue instead to leave it to the accordion.
   */
  value?: readonly string[];
  /**
   * The values of the items open at first, for an accordion that keeps its own state.
   * @default []
   */
  defaultValue?: readonly string[];
  /** Receives the values of the open items, each time an item opens or closes. */
  onValueChange?: (value: string[]) => void;
  /**
   * Lets several items be open at once; otherwise opening one closes the one that was open.
   * @default false
   */
  multiple?: boolean;
  /**
   * The level of each item's heading, for the page's outline; they look the same at every level.
   * @default 3
   */
  headingLevel?: Exclude<HeadingLevel, 1>;
  /**
   * What shows in every item's button whether the item is open, in place of the plus that becomes
   * a minus, such as a chevron the application turns while the button has data-panel-open; null
   * for none. It is hidden from assistive technology, which hears the button's expanded state. An
   * item's own indicator replaces it.
   */
  indicator?: ReactNode;
  /**
   * Where every item's indicator sits in its button: before the title, or after it at the
   * button's end. An item's own indicatorPlacement replaces it.
   * @default 'start'
   */
  indicatorPlacement?: 'start' | 'end';
  /**
   * Every item ignores presses and can't be focused.
   * @default false
   */
  disabled?: boolean;
  /**
   * Keeps closed panels in the page, hidden until found, so the browser's find in page reaches
   * their text and opens the item that holds it, where the browser supports it.
   * @default false
   */
  hiddenUntilFound?: boolean;
}

/**
 * A list of sections, each a heading that shows and hides its panel, separated by full-width
 * hairlines. A plus at the start of a heading becomes a minus while its section is open. One item
 * is open at a time unless `multiple` is set.
 */
function Root({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  headingLevel = 3,
  indicator,
  indicatorPlacement = 'start',
  disabled = false,
  hiddenUntilFound = false,
  skeleton = false,
  className,
  children,
  ...props
}: RootProps) {
  return (
    <AccordionLookContext.Provider value={{ headingLevel, indicator, indicatorPlacement }}>
      <BaseAccordion.Root
        {...props}
        {...skeletonAttributes(skeleton)}
        className={classNames('env-accordion', className)}
        value={asBaseUiMutableList(value)}
        defaultValue={asBaseUiMutableList(defaultValue)}
        onValueChange={onValueChange ? (next) => onValueChange(next as string[]) : undefined}
        multiple={multiple}
        disabled={disabled}
        hiddenUntilFound={hiddenUntilFound}
      >
        {inSkeleton(skeleton, children)}
      </BaseAccordion.Root>
    </AccordionLookContext.Provider>
  );
}

export interface ItemProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /**
   * The heading that opens and closes the section, in medium weight: say what the panel holds,
   * such as a question it answers. Given as undefined, such as over a placeholder item, a skeleton
   * shows a bar in its place.
   */
  title?: ReactNode;
  /** The panel, in muted text lined up with the title, shown while the item is open. */
  children?: ReactNode;
  /**
   * Names the item in the accordion's value, for an accordion that is controlled or opens items at
   * first. Without it, the item takes a generated one.
   */
  value?: string;
  /**
   * The item ignores presses and can't be focused; it stays dimmed.
   * @default false
   */
  disabled?: boolean;
  /** Receives whether this item is open, each time it opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Content at the end of the item's heading row, beside its button and outside it, such as a
   * Switch, a Badge with a Menu, or a Delete IconButton, placed as given.
   */
  end?: ReactNode;
  /**
   * What shows in this item's button whether it is open, in place of the Root's indicator, such as
   * a chevron the application turns while the button has data-panel-open; null for none.
   * @default the Root's indicator
   */
  indicator?: ReactNode;
  /**
   * Where this item's indicator sits in its button: before the title, or after it at the button's
   * end.
   * @default the Root's indicatorPlacement
   */
  indicatorPlacement?: 'start' | 'end';
}

/**
 * One section of an accordion: its heading, a button with a plus or minus at its start, and the
 * panel below it.
 */
function Item(allProps: ItemProps) {
  const {
    title,
    value,
    disabled,
    onOpenChange,
    end,
    indicator: itemIndicator,
    indicatorPlacement: itemIndicatorPlacement,
    className,
    children,
    ...props
  } = allProps;
  const look = useContext(AccordionLookContext);
  const Heading = `h${look.headingLevel}` as const;
  const ownIndicator = itemIndicator !== undefined ? itemIndicator : look.indicator;
  const indicatorPlacement = itemIndicatorPlacement ?? look.indicatorPlacement;
  const titleGivenEvenAsUndefined = title != null || given(allProps, 'title');
  const ownIndicatorGiven = ownIndicator !== undefined;
  const indicator =
    ownIndicator === null ? null : (
      <span className="env-accordion-indicator" aria-hidden="true">
        {ownIndicatorGiven ? (
          <Slot className="env-accordion-indicator-content" element="span" layout="row">
            {ownIndicator}
          </Slot>
        ) : (
          <>
            <IconAdd />
            <IconRemove />
          </>
        )}
      </span>
    );
  const indicatorAttribute =
    ownIndicator === null ? 'none' : indicatorPlacement === 'end' ? 'end' : undefined;
  return (
    <BaseAccordion.Item
      {...props}
      className={classNames('env-accordion-item', className)}
      data-indicator={indicatorAttribute}
      {...(value !== undefined && { value })}
      disabled={disabled}
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
    >
      <BaseAccordion.Header render={<Heading />} className="env-accordion-header">
        <BaseAccordion.Trigger className="env-accordion-trigger" data-interactive="">
          {indicatorPlacement !== 'end' && indicator}
          {titleGivenEvenAsUndefined && (
            <Slot className="env-accordion-label" element="span" grow>
              {title}
            </Slot>
          )}
          {indicatorPlacement === 'end' && indicator}
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      {end != null && (
        <Slot className="env-accordion-end" layout="row" shrink="never">
          {end}
        </Slot>
      )}
      <BaseAccordion.Panel className="env-accordion-panel">
        <div className="env-accordion-content">{children}</div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Accordion.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'Accordion.Item');
export { RootPart as Root, ItemPart as Item };
