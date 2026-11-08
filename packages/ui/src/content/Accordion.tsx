'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { createContext, useContext, type ComponentPropsWithRef, type ReactNode } from 'react';
import { IconAdd } from '../icons/Add.js';
import { IconRemove } from '../icons/Remove.js';
import { classNames } from '../internal/classNames.js';
import { inSkeleton, given, skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import '../styles/Base.css';
import '../styles/Accordion.css';

/** The level of an accordion's headings, from h2 to h6. */

const HeadingLevelContext = createContext<Exclude<HeadingLevel, 1>>(3);

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
 * is open at a time unless `multiple` is set. Built on Base UI's Accordion.
 */
function Root({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  headingLevel = 3,
  disabled = false,
  hiddenUntilFound = false,
  skeleton = false,
  className,
  children,
  ...props
}: RootProps) {
  return (
    <HeadingLevelContext.Provider value={headingLevel}>
      <BaseAccordion.Root
        {...props}
        {...skeletonAttributes(skeleton)}
        className={classNames('env-accordion', className)}
        // Base UI takes a mutable list and never changes it; the items' values are strings.
        value={value as string[] | undefined}
        defaultValue={defaultValue as string[] | undefined}
        onValueChange={onValueChange ? (next) => onValueChange(next as string[]) : undefined}
        multiple={multiple}
        disabled={disabled}
        hiddenUntilFound={hiddenUntilFound}
      >
        {inSkeleton(skeleton, children)}
      </BaseAccordion.Root>
    </HeadingLevelContext.Provider>
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
}

/**
 * One section of an accordion: its heading, a button with a plus or minus at its start, and the
 * panel below it.
 */
function Item(allProps: ItemProps) {
  const { title, value, disabled, onOpenChange, className, children, ...props } = allProps;
  const level = useContext(HeadingLevelContext);
  const Heading = `h${level}` as const;
  // A title given as undefined, as over a placeholder item, renders empty: a skeleton shows a bar.
  const hasTitle = title != null || given(allProps, 'title');
  return (
    <BaseAccordion.Item
      {...props}
      className={classNames('env-accordion-item', className)}
      {...(value !== undefined && { value })}
      disabled={disabled}
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
    >
      <BaseAccordion.Header render={<Heading />} className="env-accordion-header">
        {/* data-interactive keeps the whole row a surface in a skeleton, so its title is a bar and
            its indicator a shape, rather than one filled block. */}
        <BaseAccordion.Trigger className="env-accordion-trigger" data-interactive="">
          {/* A plus while closed, a minus while open: two icons, one shown, never a turned one. */}
          <span className="env-accordion-indicator" aria-hidden="true">
            <IconAdd />
            <IconRemove />
          </span>
          {hasTitle && <span className="env-accordion-label">{title}</span>}
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel className="env-accordion-panel">
        <div className="env-accordion-content">{children}</div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Accordion.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'Accordion.Item');
export { RootPart as Root, ItemPart as Item };
