'use client';

import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Button,
  IconButton,
  type IconButtonProps,
  type ButtonProps as ButtonElementProps,
  type ButtonVariant,
} from './Button.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { Kbd } from '../content/Kbd.js';
import { ControlDefaults } from '../internal/ControlDefaults.js';
import { classNames } from '../internal/classNames.js';
import { DirectedToolbarRoot } from '../internal/DirectedToolbarRoot.js';
import { keyShortcuts, shortcutChords } from '../internal/shortcuts.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import type { ControlSize } from '../foundations/Theme.js';

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
  /** Disables every control inside. */
  disabled?: boolean;
  /**
   * Whether the arrow keys move from the last control to the first and back.
   * @default true
   */
  loopFocus?: boolean;
  /**
   * Another element to render the toolbar as, such as a ButtonGroup that connects its buttons;
   * the toolbar's class, attributes and keyboard handling merge into its props.
   */
  render?: ReactElement;
  /** The controls: Toolbar.Button, Toolbar.Link, Toolbar.Group and Toolbar.Separator. */
  children?: ReactNode;
}

/**
 * Whether the root or a group around a button disables it, which Base UI's parts know but its
 * tooltip doesn't: a disabled button has no tooltip.
 */
const DisabledContext = createContext(false);

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
  className,
  children,
  ...props
}: RootProps) {
  // A horizontal toolbar's arrow keys follow the text direction: the root reads it.
  return (
    <DirectedToolbarRoot
      {...props}
      orientation={orientation}
      disabled={disabled}
      loopFocus={loopFocus}
      className={classNames('env-toolbar', className)}
      data-size={size}
    >
      <DisabledContext value={Boolean(disabled)}>
        <ControlDefaults variant="ghost" size={size}>
          {children}
        </ControlDefaults>
      </DisabledContext>
    </DirectedToolbarRoot>
  );
}

export interface GroupProps extends ComponentPropsWithRef<'div'> {
  /** Names the group, such as Text style, where its controls belong together. */
  'aria-label'?: string;
  /** Disables every control in the group. */
  disabled?: boolean;
  /** Another element to render the group as, such as a ButtonGroup. */
  render?: ReactElement;
}

/** Controls of a toolbar that belong together, such as the text styles. */
function Group({ className, disabled, children, ...props }: GroupProps) {
  const inherited = useContext(DisabledContext);
  return (
    <BaseToolbar.Group
      {...props}
      disabled={disabled}
      className={classNames('env-toolbar-group', className)}
    >
      <DisabledContext value={inherited || Boolean(disabled)}>{children}</DisabledContext>
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

/** What a toolbar button's tooltip shows: its label, and its shortcut as keys, chord by chord. */
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

export interface ButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label' | 'aria-pressed'> {
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
  /** As Button's: a spinner replaces the icon while the work runs. */
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
  className,
  ...props
}: ButtonProps) {
  const off = useContext(DisabledContext) || Boolean(disabled);
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
            icon,
            'aria-label': label,
            'aria-pressed': pressed,
            'aria-keyshortcuts': keyShortcuts(chords),
            'data-pressed': pressed || undefined,
            className: classNames('env-toolbar-button', className),
          } as IconButtonProps)}
        />
      }
    />
  );
  return off ? button : <Tooltip content={tooltipContent(label, chords)}>{button}</Tooltip>;
}

export type LinkProps = Omit<ComponentPropsWithRef<'a'>, 'children' | 'aria-label'> & {
  /** The destination, through the LinkProvider's link component. */
  href: string;
  /** The icon, such as Help. */
  icon: ReactNode;
  /** The destination's name, which assistive technology announces and the tooltip shows. */
  label: string;
};

/** An icon-only link of a toolbar, named by its label, which a tooltip shows. */
function Link({ icon, label, className, ...props }: LinkProps) {
  return (
    <Tooltip content={label}>
      <BaseToolbar.Link
        render={
          <Button
            {...({
              ...props,
              iconOnly: true,
              icon,
              'aria-label': label,
              className: classNames('env-toolbar-button', className),
            } as ButtonElementProps)}
          />
        }
      />
    </Tooltip>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Toolbar.Root');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'Toolbar.Group');
const SeparatorPart = /* @__PURE__ */ withDisplayName(Separator, 'Toolbar.Separator');
const ButtonPart = /* @__PURE__ */ withDisplayName(ToolbarButton, 'Toolbar.Button');
const LinkPart = /* @__PURE__ */ withDisplayName(Link, 'Toolbar.Link');
export {
  RootPart as Root,
  GroupPart as Group,
  SeparatorPart as Separator,
  ButtonPart as Button,
  LinkPart as Link,
};
