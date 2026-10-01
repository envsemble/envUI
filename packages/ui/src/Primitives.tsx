import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { Stack, ActionGroup } from './Layout.js';
import { Text } from './Text.js';
import { Surface, type SurfaceAppearanceProps } from './Surface.js';
import { NavigationIconState } from './MaterialSymbolState.js';
import { ActionElement, type ActionElementProps } from './ActionElement.js';

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

function DecorativeIcon({ children }: { children: ReactNode }) {
  return (
    <span className="env-symbol" aria-hidden="true">
      {children}
    </span>
  );
}

export type ButtonVariant = 'primary' | 'important' | 'secondary' | 'outlined' | 'destructive';

export interface ButtonAppearanceProps {
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}
export type ButtonProps = ButtonAppearanceProps & ActionElementProps;

export function Button({
  variant = 'primary',
  startIcon,
  endIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ActionElement {...props} className={classes('env-button', `env-button-${variant}`, className)}>
      {startIcon != null && <DecorativeIcon>{startIcon}</DecorativeIcon>}
      {children}
      {endIcon != null && <DecorativeIcon>{endIcon}</DecorativeIcon>}
    </ActionElement>
  );
}

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  icon: ReactNode;
  'aria-label': string;
}

export function IconButton({ icon, className, ...props }: IconButtonProps) {
  return (
    <Button {...props} className={classes('env-icon-button', className)}>
      <DecorativeIcon>{icon}</DecorativeIcon>
    </Button>
  );
}

interface NavigationItemSharedProps {
  size?: 'standard' | 'compact';
  selected?: boolean;
  disabled?: boolean;
  /** Official Material Symbols automatically follow the selected state. */
  icon?: ReactNode;
  /** Optional alternate content for custom icons when selected. */
  selectedIcon?: ReactNode;
}

export type NavigationItemProps = NavigationItemSharedProps & ActionElementProps;

export function NavigationItem(props: NavigationItemProps) {
  const {
    selected = false,
    size = 'standard',
    disabled = false,
    icon,
    selectedIcon,
    className,
    children,
    ...nativeProps
  } = props;
  const iconContent = selected && selectedIcon != null ? selectedIcon : icon;
  const content = (
    <>
      {iconContent != null && (
        <NavigationIconState selected={selected}>
          <DecorativeIcon>{iconContent}</DecorativeIcon>
        </NavigationIconState>
      )}
      {children}
    </>
  );
  const itemClass = classes(
    'env-navigation-item',
    selected && 'env-navigation-selected',
    size === 'compact' && 'env-navigation-compact',
    className,
  );

  return (
    <ActionElement
      {...nativeProps}
      disabled={disabled}
      className={itemClass}
      aria-current={props['aria-current'] ?? (selected ? 'page' : undefined)}
    >
      {content}
    </ActionElement>
  );
}

export interface InfoChipProps extends ComponentPropsWithRef<'span'> {}

export function InfoChip({ className, ...props }: InfoChipProps) {
  return <span {...props} className={classes('env-info-chip', className)} />;
}

export interface DisclosureNoteProps extends Omit<ComponentPropsWithRef<'details'>, 'title'> {
  title: ReactNode;
}

export function DisclosureNote({ title, className, children, ...props }: DisclosureNoteProps) {
  return (
    <details {...props} className={classes('env-disclosure-note', className)}>
      <summary>{title}</summary>
      <Stack gap={2} className="env-disclosure-content">
        {children}
      </Stack>
    </details>
  );
}

type CardAppearanceProps = Pick<SurfaceAppearanceProps, 'padding'> & {
  tone?: Exclude<SurfaceAppearanceProps['tone'], 'alternate'>;
};
interface CardContentProps {
  heading?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  /** An action strip implies action layout; explicit layout also works without actions. */
  layout?: 'content' | 'action';
}
interface InteractiveCardContentProps {
  heading?: never;
  meta?: never;
  actions?: never;
  layout?: never;
}
export type CardProps = CardAppearanceProps &
  (
    | (ComponentPropsWithRef<'div'> & CardContentProps & { as?: 'div'; href?: undefined })
    | (ComponentPropsWithRef<'article'> & CardContentProps & { as: 'article'; href?: undefined })
    | (ComponentPropsWithRef<'button'> &
        InteractiveCardContentProps & { as: 'button'; href?: undefined })
    | (ComponentPropsWithRef<'a'> &
        InteractiveCardContentProps & { as?: 'a'; href: string; disabled?: boolean })
  );

/** Shared card surface, optionally a native action or a content card with an action strip. */
export function Card({
  as,
  tone = 'row',
  padding,
  heading,
  meta,
  actions,
  layout = 'content',
  className,
  style,
  children,
  ...props
}: CardProps) {
  const interactive = props.href !== undefined || as === 'button';
  const actionLayout = layout === 'action' || actions != null;
  const cardClass = classes(
    'env-card',
    'env-card-content',
    tone === 'pane' && 'env-card-pane',
    tone === 'canvas' && 'env-card-canvas',
    interactive && 'env-clickable-card',
    actionLayout && 'env-action-card',
    className,
  );
  const content = (
    <>
      {(heading != null || meta != null) && (
        <div className="env-action-card-heading">
          {heading != null && (
            <Text as="h3" variant="section-heading">
              {heading}
            </Text>
          )}
          {meta != null && (
            <Text as="span" variant="supporting" className="env-action-card-meta">
              {meta}
            </Text>
          )}
        </div>
      )}
      {children}
    </>
  );
  const root = interactive ? (
    <Stack
      gap={4}
      render={<ActionElement {...(props as ActionElementProps)} />}
      className={cardClass}
      style={style}
    />
  ) : (
    <Stack
      {...(props as ComponentPropsWithRef<'div'> & ComponentPropsWithRef<'article'>)}
      as={as === 'article' ? 'article' : 'div'}
      gap={actionLayout ? 0 : 4}
      className={cardClass}
      style={style}
    />
  );
  return (
    <Surface tone={tone} padding={padding} render={root}>
      {interactive ? (
        children
      ) : actionLayout ? (
        <>
          <Stack className="env-action-card-body">{content}</Stack>
          {actions != null && (
            <ActionGroup as="footer" align="end" className="env-action-card-actions">
              {actions}
            </ActionGroup>
          )}
        </>
      ) : (
        content
      )}
    </Surface>
  );
}

export type ClickableCardProps =
  | (ComponentPropsWithRef<'button'> & { href?: never })
  | (ComponentPropsWithRef<'a'> & { href: string; disabled?: boolean });

/** A single interactive surface. Do not nest links or controls inside it. */
export function ClickableCard(props: ClickableCardProps) {
  if (props.href !== undefined) {
    return <Card {...props} />;
  }
  return <Card {...props} as="button" />;
}

export interface ActionCardProps extends Omit<ComponentPropsWithRef<'article'>, 'title'> {
  title?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function ActionCard({
  title,
  meta,
  actions,
  className,
  children,
  ...props
}: ActionCardProps) {
  return (
    <Card
      {...props}
      as="article"
      layout="action"
      heading={title}
      meta={meta}
      actions={actions}
      className={className}
    >
      {children}
    </Card>
  );
}

export interface FeatureCardProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function FeatureCard({
  icon,
  title,
  description,
  action,
  className,
  children,
  ...props
}: FeatureCardProps) {
  return (
    <Card {...props} className={classes('env-feature-card', className)}>
      <div className="env-feature-card-layout">
        {icon != null && (
          <div className="env-feature-card-icon">
            <DecorativeIcon>{icon}</DecorativeIcon>
          </div>
        )}
        <Stack className="env-feature-card-copy">
          <Stack gap={1}>
            <Text as="h2" variant="page-heading">
              {title}
            </Text>
            {description != null && (
              <Text variant="supporting" className="env-feature-card-description">
                {description}
              </Text>
            )}
          </Stack>
          {children != null && <Stack className="env-feature-card-extra">{children}</Stack>}
        </Stack>
        {action != null && <div className="env-feature-card-action">{action}</div>}
      </div>
    </Card>
  );
}

export interface GroupedRowsProps extends ComponentPropsWithRef<'ul'> {
  contrast?: boolean;
}

export function GroupedRows({ contrast = false, className, ...props }: GroupedRowsProps) {
  const rows = (
    <ul {...props} className={classes('env-grouped-rows', 'env-connected-rows', className)} />
  );
  return contrast ? (
    <Surface tone="row" padding={3} className="env-contrast-row-pane">
      {rows}
    </Surface>
  ) : (
    rows
  );
}

export interface RowProps extends Omit<ComponentPropsWithRef<'li'>, 'title'> {
  title: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
}

export function Row({ title, detail, action, children, className, ...props }: RowProps) {
  return (
    <li {...props} className={classes('env-row', 'env-connected-row', className)}>
      <div>
        {title}
        {detail != null && <small>{detail}</small>}
        {children}
      </div>
      {action}
    </li>
  );
}

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} className={classes('env-empty-state', className)}>
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <Stack gap={2} className="env-empty-copy">
        <Text as="h4" variant="section-heading">
          {title}
        </Text>
        {description != null && <Text variant="supporting">{description}</Text>}
        {children}
      </Stack>
      {action}
    </div>
  );
}

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  tone?: 'base' | 'highlight';
}

export function Skeleton({
  width,
  height,
  tone = 'base',
  style,
  className,
  ...props
}: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={classes(
        'env-skeleton',
        tone === 'highlight' && 'env-skeleton-highlight',
        className,
      )}
      style={{ width, height, ...style }}
    />
  );
}

export interface LoadingStateProps extends ComponentPropsWithRef<'div'> {
  label?: string;
}

export function LoadingState({
  label = 'Loading',
  className,
  children,
  ...props
}: LoadingStateProps) {
  return (
    <div
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? label}
      aria-busy="true"
      className={classes('env-loading-state', className)}
    >
      {children}
    </div>
  );
}
