import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { Stack } from './Layout.js';

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

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  startIcon,
  endIcon,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={classes('env-button', `env-button-${variant}`, className)}
    >
      {startIcon != null && <DecorativeIcon>{startIcon}</DecorativeIcon>}
      {children}
      {endIcon != null && <DecorativeIcon>{endIcon}</DecorativeIcon>}
    </button>
  );
}

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  icon: ReactNode;
  'aria-label': string;
}

export function IconButton({ icon, type = 'button', className, ...props }: IconButtonProps) {
  return (
    <button {...props} type={type} className={classes('env-button', 'env-icon-button', className)}>
      <DecorativeIcon>{icon}</DecorativeIcon>
    </button>
  );
}

interface NavigationItemSharedProps {
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  selectedIcon?: ReactNode;
}

export type NavigationItemProps = NavigationItemSharedProps &
  (
    | (ComponentPropsWithRef<'a'> & { href: string })
    | (ComponentPropsWithRef<'button'> & { href?: undefined })
  );

export function NavigationItem(props: NavigationItemProps) {
  const {
    selected = false,
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
      {iconContent != null && <DecorativeIcon>{iconContent}</DecorativeIcon>}
      {children}
    </>
  );
  const itemClass = classes(
    'env-navigation-item',
    selected && 'env-navigation-selected',
    className,
  );

  if (nativeProps.href !== undefined) {
    const { href, onClick, tabIndex, ...anchorProps } = nativeProps as ComponentPropsWithRef<'a'>;
    return (
      <a
        {...anchorProps}
        href={disabled ? undefined : href}
        className={itemClass}
        role={anchorProps.role ?? (disabled ? 'link' : undefined)}
        aria-current={props['aria-current'] ?? (selected ? 'page' : undefined)}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : tabIndex}
        onClick={function handleClick(event) {
          if (disabled) event.preventDefault();
          else onClick?.(event);
        }}
      >
        {content}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = nativeProps as ComponentPropsWithRef<'button'>;
  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled}
      className={itemClass}
      aria-current={props['aria-current'] ?? (selected ? 'page' : undefined)}
    >
      {content}
    </button>
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
      <div className="env-disclosure-content">{children}</div>
    </details>
  );
}

export interface CardProps extends ComponentPropsWithRef<'div'> {
  /** Row tone for standalone cards; pane tone for grouped content areas. */
  tone?: 'row' | 'pane';
}

export function Card({ tone = 'row', className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={classes(
        'env-card',
        'env-card-content',
        tone === 'pane' && 'env-card-pane',
        className,
      )}
    />
  );
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
    <article {...props} className={classes('env-card', 'env-action-card', className)}>
      <div className="env-action-card-body">
        {(title != null || meta != null) && (
          <div className="env-action-card-heading">
            {title != null && <h3>{title}</h3>}
            {meta != null && <span className="env-action-card-meta">{meta}</span>}
          </div>
        )}
        {children}
      </div>
      {actions != null && <footer className="env-action-card-actions">{actions}</footer>}
    </article>
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
    <div {...props} className={classes('env-card', 'env-feature-card', className)}>
      <div className="env-feature-card-layout">
        {icon != null && (
          <div className="env-feature-card-icon">
            <DecorativeIcon>{icon}</DecorativeIcon>
          </div>
        )}
        <div className="env-feature-card-copy">
          <h2>{title}</h2>
          {description != null && <p>{description}</p>}
          {children != null && <Stack className="env-feature-card-extra">{children}</Stack>}
        </div>
        {action != null && <div className="env-feature-card-action">{action}</div>}
      </div>
    </div>
  );
}

export interface GroupedRowsProps extends ComponentPropsWithRef<'ul'> {
  contrast?: boolean;
}

export function GroupedRows({ contrast = false, className, ...props }: GroupedRowsProps) {
  const rows = <ul {...props} className={classes('env-grouped-rows', className)} />;
  return contrast ? <div className="env-contrast-row-pane">{rows}</div> : rows;
}

export interface RowProps extends Omit<ComponentPropsWithRef<'li'>, 'title'> {
  title: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
}

export function Row({ title, detail, action, children, className, ...props }: RowProps) {
  return (
    <li {...props} className={classes('env-row', className)}>
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
      <div className="env-empty-copy">
        <h4>{title}</h4>
        {description != null && <p>{description}</p>}
        {children}
      </div>
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
