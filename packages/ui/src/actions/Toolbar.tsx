'use client';

import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { IconButton, type IconButtonProps, type ButtonVariant } from './Button.js';
import { Tooltip } from '../overlays/Tooltip.js';
import { Kbd } from '../content/Kbd.js';
import { ControlDefaults } from '../internal/control/ControlDefaults.js';
import { classNames } from '../internal/classNames.js';
import { Column, Row } from '../layout/Layout.js';
import { DirectedToolbarRoot } from './internal/DirectedToolbarRoot.js';
import { keyShortcuts, shortcutChords } from './internal/shortcuts.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import type { ControlSize } from '../foundations/Theme.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Toolbar.css';

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Names the toolbar for assistive technology, such as Formatting. */
  'aria-label'?: string;
  /** The direction the controls run in, and which arrow keys move between them. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * The height of the buttons inside, as on every control: sm, md or lg in the current scale.
   * Without it, the control height of the container.
   */
  size?: ControlSize;
  /**
   * Disables every control inside.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the arrow keys move from the last control to the first and back.
   * @default true
   */
  loopFocus?: boolean;
  /**
   * Milliseconds the pointer rests on a button or link before its tooltip opens, as Tooltip's
   * delay; keyboard focus opens it at once. 0 shows every name at once, for a toolbar people scan
   * by pointing, such as a canvas's view controls.
   * @default 400
   */
  tooltipDelay?: number;
  /**
   * Another element to render the toolbar as, such as a ButtonGroup that connects its buttons;
   * the toolbar's class, attributes and keyboard handling merge into its props.
   */
  render?: ReactElement;
  /**
   * The controls: Toolbar.Button, Toolbar.Link, Toolbar.Item, Toolbar.Input, Toolbar.Group and
   * Toolbar.Separator.
   */
  children?: ReactNode;
}

const DisabledByToolbarOrGroupContext = createContext(false);

const TooltipDelayContext = createContext<number | undefined>(undefined);

const OrientationContext = createContext<'horizontal' | 'vertical'>('horizontal');

function lineOf(orientation: 'horizontal' | 'vertical', render: ReactElement | undefined) {
  return orientation === 'vertical' ? (
    <Column align="center" gap={1} render={render} />
  ) : (
    <Row align="center" gap={1} render={render} />
  );
}

/**
 * A row, or a column, of controls for one subject, such as a text editor's formatting: one tab stop,
 * with the arrow keys moving between its controls (the APG toolbar pattern). Buttons the
 * application puts inside take the ghost variant unless they set another.
 */
function Root({
  orientation = 'horizontal',
  size,
  disabled,
  loopFocus = true,
  tooltipDelay,
  className,
  render,
  children,
  ...props
}: RootProps) {
  return (
    <DirectedToolbarRoot
      {...props}
      render={lineOf(orientation, render)}
      orientation={orientation}
      disabled={disabled}
      loopFocus={loopFocus}
      className={classNames('env-toolbar', className)}
      data-orientation={orientation}
      data-size={size}
    >
      <OrientationContext value={orientation}>
        <TooltipDelayContext value={tooltipDelay}>
          <DisabledByToolbarOrGroupContext value={Boolean(disabled)}>
            <ControlDefaults variant="ghost" size={size}>
              {children}
            </ControlDefaults>
          </DisabledByToolbarOrGroupContext>
        </TooltipDelayContext>
      </OrientationContext>
    </DirectedToolbarRoot>
  );
}

export interface GroupProps extends ComponentPropsWithRef<'div'> {
  /** Names the group, such as Text style, where its controls belong together. */
  'aria-label'?: string;
  /**
   * Disables every control in the group.
   * @default false
   */
  disabled?: boolean;
  /** Another element to render the group as, such as a ButtonGroup. */
  render?: ReactElement;
}

/** Controls of a toolbar that belong together, such as the text styles. */
function Group({ className, disabled, render, children, ...props }: GroupProps) {
  const inherited = useContext(DisabledByToolbarOrGroupContext);
  const orientation = useContext(OrientationContext);
  return (
    <BaseToolbar.Group
      {...props}
      render={lineOf(orientation, render)}
      disabled={disabled}
      className={classNames('env-toolbar-group', className)}
      data-orientation={orientation}
    >
      <DisabledByToolbarOrGroupContext value={inherited || Boolean(disabled)}>
        {children}
      </DisabledByToolbarOrGroupContext>
    </BaseToolbar.Group>
  );
}

export type SeparatorProps = ComponentPropsWithRef<'div'>;

/** A line between groups of a toolbar's controls, across the toolbar's direction. */
function Separator({ className, ...props }: SeparatorProps) {
  return (
    <BaseToolbar.Separator {...props} className={classNames('env-toolbar-separator', className)} />
  );
}

function tooltipContent(label: string, chords: string[][]) {
  if (chords.length === 0) return label;
  return (
    <span className="env-toolbar-tooltip">
      {label}{' '}
      {chords.map((keys, index) => (
        <Kbd key={index} keys={keys} />
      ))}
    </span>
  );
}

export interface ButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-label' | 'aria-pressed'
> {
  /** The icon, such as FormatBold. */
  icon: ReactNode;
  /**
   * The action's name, such as Bold: assistive technology announces it, and the tooltip shows it
   * on hover and focus.
   */
  label: string;
  /**
   * For a button that turns something on and off, such as Bold: whether it is on. It is announced
   * as pressed and drawn selected. Leave it out for a button that acts once, such as Undo.
   */
  pressed?: boolean;
  /**
   * The keyboard shortcut that does the same, such as Ctrl+B, with keys joined by +: the tooltip
   * shows it, and aria-keyshortcuts announces it, in ARIA's key names, such as Control+B. A
   * sequence, such as Ctrl+K Ctrl+B, shows its keys without the attribute, as in Menu.
   */
  shortcut?: string;
  /** As Button's; ghost by default, from the toolbar. */
  variant?: ButtonVariant;
  /**
   * As Button's: danger for an action that destroys, such as Delete, so it keeps its warning
   * without a label.
   * @default 'neutral'
   */
  tone?: 'neutral' | 'danger';
  /**
   * As Button's: a spinner replaces the icon while the work runs.
   * @default false
   */
  pending?: boolean;
}

/**
 * An icon-only button of a toolbar, named by its label, which a tooltip shows; disabled, it leaves
 * the arrow keys' path.
 */
function ToolbarButton({
  icon,
  label,
  pressed,
  shortcut,
  disabled,
  variant,
  tone,
  className,
  ...props
}: ButtonProps) {
  const disabledHasNoTooltip = useContext(DisabledByToolbarOrGroupContext) || Boolean(disabled);
  const delay = useContext(TooltipDelayContext);
  const chords = shortcut ? shortcutChords(shortcut) : [];
  const button = (
    <BaseToolbar.Button
      disabled={disabled}
      focusableWhenDisabled={false}
      render={
        <IconButton
          {...({
            ...props,
            variant,
            tone,
            icon,
            'aria-label': label,
            'aria-pressed': pressed,
            'aria-keyshortcuts': keyShortcuts(chords),
            'data-pressed': flag(pressed),
            className: classNames('env-toolbar-button', className),
          } as IconButtonProps)}
        />
      }
    />
  );
  return disabledHasNoTooltip ? (
    button
  ) : (
    <Tooltip content={tooltipContent(label, chords)} delay={delay}>
      {button}
    </Tooltip>
  );
}

export type LinkProps = Omit<ComponentPropsWithRef<'a'>, 'children' | 'aria-label'> & {
  /** The destination, through the LinkProvider's link component. */
  href: string;
  /** The icon, such as Help. */
  icon: ReactNode;
  /** The destination's name, which assistive technology announces and the tooltip shows. */
  label: string;
};

/**
 * An icon-only link of a toolbar, named by its label, which a tooltip shows. In a disabled toolbar
 * or group it has no destination: it reports aria-disabled, leaves the arrow keys' path and has no
 * tooltip, as a disabled button does.
 */
function Link({ icon, label, className, ...props }: LinkProps) {
  const disabledByToolbarOrGroup = useContext(DisabledByToolbarOrGroupContext);
  const delay = useContext(TooltipDelayContext);
  if (disabledByToolbarOrGroup)
    return (
      <IconButton
        {...props}
        icon={icon}
        disabled
        aria-label={label}
        className={classNames('env-toolbar-button', className)}
      />
    );
  return (
    <Tooltip content={label} delay={delay}>
      <BaseToolbar.Link
        render={
          <IconButton
            {...props}
            icon={icon}
            aria-label={label}
            className={classNames('env-toolbar-button', className)}
          />
        }
      />
    </Tooltip>
  );
}

export interface ItemProps extends ComponentPropsWithRef<'button'> {
  /**
   * The control, which joins the toolbar's arrow-key path as one of its stops: a button with a
   * visible label, such as <Button start={<IconShare />}>Share</Button>, or the trigger of a
   * Menu or another popup. The item's props, ref and keyboard handling merge into its props; a
   * Button takes the toolbar's ghost variant unless it sets another.
   */
  render: ReactElement;
  /**
   * The control can't be pressed, and leaves the arrow keys' path.
   * @default false
   */
  disabled?: boolean;
}

/**
 * Any button-like control as one stop of a toolbar's arrow-key path, such as a labelled Button or
 * a Menu's trigger: `<Menu.Root trigger={<Toolbar.Item render={<Button>Paragraph</Button>} />}>`.
 */
function Item({ render, disabled, ...props }: ItemProps) {
  return (
    <BaseToolbar.Button
      {...props}
      disabled={disabled}
      focusableWhenDisabled={false}
      render={render}
    />
  );
}

export interface InputProps extends ComponentPropsWithRef<'input'> {
  /**
   * The input to render, such as an input of the application's own; a native input by default.
   * The toolbar's props and keyboard handling merge into its props.
   */
  render?: ReactElement;
}

/**
 * A text input as one stop of a toolbar's arrow-key path, such as a font size: the arrow keys move
 * its caret, and leave it for the next control at the text's ends. Name it with aria-label.
 */
function Input({ render, ...props }: InputProps) {
  return <BaseToolbar.Input {...props} render={render} />;
}

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Toolbar.Root');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'Toolbar.Group');
const SeparatorPart = /* @__PURE__ */ withDisplayName(Separator, 'Toolbar.Separator');
const ButtonPart = /* @__PURE__ */ withDisplayName(ToolbarButton, 'Toolbar.Button');
const LinkPart = /* @__PURE__ */ withDisplayName(Link, 'Toolbar.Link');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'Toolbar.Item');
const InputPart = /* @__PURE__ */ withDisplayName(Input, 'Toolbar.Input');
export {
  RootPart as Root,
  GroupPart as Group,
  SeparatorPart as Separator,
  ButtonPart as Button,
  LinkPart as Link,
  ItemPart as Item,
  InputPart as Input,
};
