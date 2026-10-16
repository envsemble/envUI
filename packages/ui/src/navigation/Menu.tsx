import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  useContext,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Check } from '../icons/Check.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { Kbd } from '../content/Kbd.js';
import { useLinkComponent } from './LinkProvider.js';
import {
  MenuDensityContext,
  menuPopupInlineInset,
  menuPopupInset,
  renderMenuPopup,
} from './internal/MenuPopup.js';
import { withDisplayName } from '../internal/withDisplayName.js';

export interface RootProps {
  /**
   * The control that opens the menu, such as a Button or an AvatarButton; it receives the menu
   * button semantics and ref, so it must accept native props and a ref.
   */
  trigger: ReactElement;
  /** Accessible name of the menu, such as Account. */
  'aria-label': string;
  /**
   * Menu.Header, Menu.Item, Menu.Group, Menu.RadioGroup, Menu.CheckboxItem, Menu.Submenu and Menu.Separator
   * elements.
   */
  children: ReactNode;
  /**
   * The side of the trigger the menu opens on; it flips to the other side where the window has no
   * room.
   */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** How the menu lines up with the trigger along that side. */
  align?: 'start' | 'center' | 'end';
  /**
   * Whether the menu is open, for a controlled menu; leave it out and the menu opens and closes
   * itself.
   */
  open?: boolean;
  /**
   * Whether an uncontrolled menu starts open.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called with the new visibility as the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * compact is the desktop dropdown for dense surfaces: a raised popup with 1.75 rem rows, hairline
   * separators and small keys for shortcuts. Submenus open in the same density.
   */
  density?: Density;
  /** Class of the menu popup. */
  className?: string;
}

export type Density = 'standard' | 'compact';

/** A list of actions and destinations that opens from a trigger; keyboard and focus follow the menu pattern. */
function Root({
  trigger,
  'aria-label': label,
  children,
  side = 'bottom',
  align = 'end',
  open,
  defaultOpen,
  onOpenChange,
  density = 'standard',
  className,
}: RootProps) {
  const theme = useTheme();
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <Theme theme={theme} className="env-menu-theme">
          <BaseMenu.Positioner
            side={side}
            align={align}
            sideOffset={8}
            className="env-menu-positioner"
          >
            <BaseMenu.Popup
              className={classNames('env-menu', className)}
              // Base UI names the menu after its trigger; the menu's own label replaces that name.
              render={renderMenuPopup(label, density)}
            >
              <MenuDensityContext value={density}>{children}</MenuDensityContext>
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </Theme>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export interface HeaderProps extends ComponentPropsWithRef<'div'> {
  /** The context, such as the signed-in person's avatar, name and e-mail address. */
  children: ReactNode;
}

/** Non-interactive context at the top of a menu, such as the signed-in account. */
function Header({ className, ...props }: HeaderProps) {
  return (
    <div role="presentation" {...props} className={classNames('env-menu-header', className)} />
  );
}

interface ItemContentProps {
  /** A decorative icon before the label, such as Settings. */
  icon?: ReactNode;
  /** The item's label, which names it. */
  children: ReactNode;
  /** A second, muted line; announced as the item's description. */
  description?: ReactNode;
  /**
   * Keyboard hint at the end, such as Ctrl+P, shown as Kbd keys and announced as aria-keyshortcuts;
   * a sequence, such as Ctrl+K Ctrl+S, shows its keys without the attribute. The application
   * handles the shortcut itself.
   */
  shortcut?: string;
  /** End content, such as a Badge or CounterBadge; it is part of the item's name. */
  trailing?: ReactNode;
}

const keyNames: Record<string, string> = {
  ctrl: 'Control',
  control: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  '⌘': 'Meta',
  win: 'Meta',
  alt: 'Alt',
  option: 'Alt',
  '⌥': 'Alt',
  shift: 'Shift',
  '⇧': 'Shift',
  esc: 'Escape',
  del: 'Delete',
  space: 'Space',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
};

/**
 * A displayed hint such as Ctrl+Shift+P, Ctrl++ or a sequence such as Ctrl+K Ctrl+S, as the keys of
 * each chord. Spaces around + join a chord.
 */
function shortcutChords(shortcut: string) {
  return (
    shortcut
      .trim()
      // A spaced + between two keys joins them; a + that is itself the key stays.
      .replace(/(\S)\s+\+\s+(?=\S)/g, '$1+')
      .split(/\s+/)
      .filter(Boolean)
      // Each key is followed by a + or the end; a + right after a separator is the key itself.
      .map((chord) => Array.from(chord.matchAll(/([^+]+|\+)(?:\+|$)/g), (match) => match[1]!))
      .filter((keys) => keys.length > 0)
  );
}

/**
 * aria-keyshortcuts for a single chord, such as Control+Shift+P or Control+Plus. ARIA lists
 * alternative shortcuts, not sequences, so a sequence shows its keys without the attribute.
 */
function keyShortcuts(chords: string[][]) {
  if (chords.length !== 1) return undefined;
  return chords[0]!
    .map((key) => (key === '+' ? 'Plus' : (keyNames[key.toLowerCase()] ?? key)))
    .join('+');
}

/** Shared item layout: indicator, icon, label with optional description, trailing content, shortcut. */
function useMenuItemContent(
  { icon, children, description, shortcut, trailing }: ItemContentProps,
  indicator?: ReactNode,
) {
  const descriptionId = useId();
  const chords = shortcut ? shortcutChords(shortcut) : [];
  const content = (
    <>
      {indicator}
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <span className="env-menu-item-text">
        <span className="env-menu-item-label">{children}</span>
        {description != null && (
          // Announced through aria-describedby rather than as part of the item's name.
          <span className="env-menu-item-description" id={descriptionId} aria-hidden="true">
            {description}
          </span>
        )}
      </span>
      {trailing != null && <span className="env-menu-item-trailing">{trailing}</span>}
      {chords.length > 0 && (
        // aria-keyshortcuts announces the shortcut; the keys show it.
        <span className="env-menu-item-shortcut" aria-hidden="true">
          {chords.map((keys, index) => (
            <Kbd key={index} keys={keys} />
          ))}
        </span>
      )}
    </>
  );
  return {
    content,
    accessibility: {
      'aria-describedby': description != null ? descriptionId : undefined,
      'aria-keyshortcuts': keyShortcuts(chords),
    },
  };
}

interface ItemSharedProps extends ItemContentProps {
  /**
   * The item is unavailable: it stays in place, dimmed, and reports aria-disabled; its action does
   * not run.
   * @default false
   */
  disabled?: boolean;
  /** Class of the item's row. */
  className?: string;
}

export type ItemProps = ItemSharedProps &
  (
    | {
        /** The destination: the item is a link, through the LinkProvider's link component. */
        href: string;
        onClick?: never;
        /** Where the destination opens, such as _blank, as on a native link. */
        target?: string;
        /** The destination's relationship to the page, such as noopener, as on a native link. */
        rel?: string;
      }
    | {
        href?: undefined;
        /** The action, run when the item is chosen; the menu then closes. */
        onClick?: () => void;
        target?: never;
        rel?: never;
      }
  );

/** One action (onClick) or destination (href) in a Menu. Destinations use the LinkProvider's link. */
function Item({
  icon,
  children,
  description,
  shortcut,
  trailing,
  disabled,
  className,
  ...props
}: ItemProps) {
  const LinkComponent = useLinkComponent();
  const { content, accessibility } = useMenuItemContent({
    icon,
    children,
    description,
    shortcut,
    trailing,
  });
  const itemClassName = classNames('env-menu-item', className);
  if (props.href !== undefined) {
    return (
      <BaseMenu.LinkItem
        className={itemClassName}
        // The link component comes from LinkProvider and keeps its identity between renders.
        // eslint-disable-next-line react-hooks/static-components
        render={<LinkComponent href={props.href} target={props.target} rel={props.rel} />}
        aria-disabled={disabled || undefined}
        {...accessibility}
      >
        {content}
      </BaseMenu.LinkItem>
    );
  }
  return (
    <BaseMenu.Item
      className={itemClassName}
      disabled={disabled}
      onClick={props.onClick}
      {...accessibility}
    >
      {content}
    </BaseMenu.Item>
  );
}

/** Separates groups of menu items. */
function Separator() {
  return <BaseMenu.Separator className="env-menu-separator" />;
}

export interface SubmenuProps extends Omit<ItemContentProps, 'children' | 'shortcut' | 'trailing'> {
  /** The label of the row that opens the submenu, which names the row. */
  label: ReactNode;
  /** The submenu's items: Menu.Item, Menu.Group, Menu.Separator and the other parts, nested submenus too. */
  children: ReactNode;
  /** Accessible name of the submenu; by default the label, when it is a string. */
  'aria-label'?: string;
  /**
   * The row stays in place, dimmed, but cannot open its submenu.
   * @default false
   */
  disabled?: boolean;
  /** Controlled visibility; onOpenChange also suits loading the items as the submenu opens. */
  open?: boolean;
  /**
   * Whether an uncontrolled submenu starts open.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the new visibility as the submenu opens or closes, for example to load its items.
   */
  onOpenChange?: (open: boolean) => void;
  /** Class of the submenu popup. */
  className?: string;
}

/** Gap between a submenu and the edge of the menu it opens from, in pixels. */
const submenuGap = 2;
/** Ways of closing only the submenu, after which focus returns to the row that opened it. */
const submenuReturnReasons = new Set(['escape-key', 'list-navigation']);

/**
 * A row that opens a nested menu beside it, on hover or with the keyboard. The submenu opens in the
 * density and theme of its menu, and lines its first row up with the row that opened it.
 */
function Submenu({
  label,
  icon,
  description,
  children,
  'aria-label': ariaLabel,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: SubmenuProps) {
  const theme = useTheme();
  const density = useContext(MenuDensityContext);
  const trigger = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const closeReason = useRef<string | null>(null);
  const { content, accessibility } = useMenuItemContent({ icon, children: label, description });
  const textLabel = typeof label === 'string' ? label : undefined;
  return (
    <BaseMenu.SubmenuRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, details) => {
        closeReason.current = next ? null : details.reason;
        onOpenChange?.(next);
      }}
    >
      <BaseMenu.SubmenuTrigger
        ref={trigger}
        className="env-menu-item env-menu-submenu-trigger"
        disabled={disabled}
        label={textLabel}
        {...accessibility}
      >
        {content}
        <span className="env-symbol env-menu-submenu-chevron" aria-hidden="true">
          <ChevronRight />
        </span>
      </BaseMenu.SubmenuTrigger>
      <BaseMenu.Portal>
        <Theme theme={theme} className="env-menu-theme">
          <BaseMenu.Positioner
            className="env-menu-positioner"
            side="inline-end"
            align="start"
            // The submenu clears the edge of its menu by a small gap, and its first row lines up
            // with the row that opened it. Collisions flip it to the other side.
            sideOffset={() =>
              menuPopupInlineInset(trigger.current?.closest('.env-menu')) + submenuGap
            }
            alignOffset={() => -menuPopupInset(popup.current)}
          >
            <BaseMenu.Popup
              ref={popup}
              className={classNames('env-menu', className)}
              render={renderMenuPopup(ariaLabel ?? textLabel, density)}
              // Escape and ← close only the submenu and return to its row. Otherwise focus has
              // moved on, or an item closed the whole menu, whose own trigger takes focus.
              finalFocus={() =>
                submenuReturnReasons.has(closeReason.current ?? '')
                  ? (trigger.current ?? false)
                  : false
              }
            >
              <MenuDensityContext value={density}>{children}</MenuDensityContext>
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </Theme>
      </BaseMenu.Portal>
    </BaseMenu.SubmenuRoot>
  );
}

export interface GroupProps {
  /** Small heading that names the group for assistive technology too. */
  label: ReactNode;
  /** Items of the group. */
  children: ReactNode;
  /** Class of the group. */
  className?: string;
}

/** A labelled group of related items, with a small heading above its rows. */
function Group({ label, children, className }: GroupProps) {
  return (
    <BaseMenu.Group className={classNames('env-menu-group', className)}>
      <BaseMenu.GroupLabel className="env-menu-group-label">{label}</BaseMenu.GroupLabel>
      {children}
    </BaseMenu.Group>
  );
}

export interface RadioGroupProps {
  /** Value of the checked item, or null for none. */
  value: string | null;
  /** Called with the chosen item's value. */
  onValueChange: (value: string) => void;
  /** Menu.RadioItem elements. */
  children: ReactNode;
  /** Optional heading; the group is then labelled like Menu.Group. */
  label?: ReactNode;
  /** Class of the group. */
  className?: string;
}

/** One choice among several items; the checked item shows a check mark. */
function RadioGroup({ value, onValueChange, children, label, className }: RadioGroupProps) {
  return (
    <BaseMenu.RadioGroup
      className={classNames('env-menu-group', className)}
      value={value}
      onValueChange={(next: string) => onValueChange(next)}
    >
      {label != null && (
        <BaseMenu.GroupLabel className="env-menu-group-label">{label}</BaseMenu.GroupLabel>
      )}
      {children}
    </BaseMenu.RadioGroup>
  );
}

/** The check mark of a checked radio or checkbox item; the slot keeps labels aligned. */
function CheckIndicator({ kind }: { kind: 'radio' | 'checkbox' }) {
  const Indicator = kind === 'radio' ? BaseMenu.RadioItemIndicator : BaseMenu.CheckboxItemIndicator;
  return (
    <span className="env-menu-item-check" aria-hidden="true">
      <Indicator className="env-symbol env-menu-item-check-mark">
        <Check />
      </Indicator>
    </span>
  );
}

export interface RadioItemProps extends Omit<ItemContentProps, 'shortcut' | 'trailing'> {
  /** The value the Menu.RadioGroup reports when this item is chosen. */
  value: string;
  /**
   * The item stays in place, dimmed, but cannot be chosen.
   * @default false
   */
  disabled?: boolean;
  /** Close the menu after choosing. */
  closeOnClick?: boolean;
  /** Class of the item's row. */
  className?: string;
}

/** One option of a Menu.RadioGroup. */
function RadioItem({
  value,
  disabled,
  closeOnClick = true,
  className,
  ...contentProps
}: RadioItemProps) {
  const { content, accessibility } = useMenuItemContent(
    contentProps,
    <CheckIndicator kind="radio" />,
  );
  return (
    <BaseMenu.RadioItem
      value={value}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={classNames('env-menu-item env-menu-choice', className)}
      {...accessibility}
    >
      {content}
    </BaseMenu.RadioItem>
  );
}

export interface CheckboxItemProps extends Omit<ItemContentProps, 'trailing'> {
  /** Whether the option is on; a check mark shows while it is. */
  checked: boolean;
  /** Called with the new state when the item is toggled. */
  onCheckedChange: (checked: boolean) => void;
  /**
   * The item stays in place, dimmed, but cannot be toggled.
   * @default false
   */
  disabled?: boolean;
  /** Close the menu after toggling; off by default, so several options can change. */
  closeOnClick?: boolean;
  /** Class of the item's row. */
  className?: string;
}

/** An independent on/off option; a check mark shows while it is on. */
function CheckboxItem({
  checked,
  onCheckedChange,
  disabled,
  closeOnClick = false,
  className,
  ...contentProps
}: CheckboxItemProps) {
  const { content, accessibility } = useMenuItemContent(
    contentProps,
    <CheckIndicator kind="checkbox" />,
  );
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      onCheckedChange={(next: boolean) => onCheckedChange(next)}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={classNames('env-menu-item env-menu-choice', className)}
      {...accessibility}
    >
      {content}
    </BaseMenu.CheckboxItem>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Menu.Root');
const HeaderPart = /* @__PURE__ */ withDisplayName(Header, 'Menu.Header');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'Menu.Item');
const SeparatorPart = /* @__PURE__ */ withDisplayName(Separator, 'Menu.Separator');
const SubmenuPart = /* @__PURE__ */ withDisplayName(Submenu, 'Menu.Submenu');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'Menu.Group');
const RadioGroupPart = /* @__PURE__ */ withDisplayName(RadioGroup, 'Menu.RadioGroup');
const RadioItemPart = /* @__PURE__ */ withDisplayName(RadioItem, 'Menu.RadioItem');
const CheckboxItemPart = /* @__PURE__ */ withDisplayName(CheckboxItem, 'Menu.CheckboxItem');
export {
  RootPart as Root,
  HeaderPart as Header,
  ItemPart as Item,
  SeparatorPart as Separator,
  SubmenuPart as Submenu,
  GroupPart as Group,
  RadioGroupPart as RadioGroup,
  RadioItemPart as RadioItem,
  CheckboxItemPart as CheckboxItem,
};
