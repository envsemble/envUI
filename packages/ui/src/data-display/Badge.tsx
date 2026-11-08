import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { IconCheck } from '../icons/Check.js';
import '../styles/Base.css';
import '../styles/Badge.css';

export type BadgeTone =
  'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'done';

/** A badge's emphasis: a tinted, a filled or an outlined pill. */
export type BadgeVariant = 'soft' | 'solid' | 'outline';

interface BadgeAppearanceProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * Meaning of the state: primary is the blue of what is current, accent the purple that stands
   * out, done the quiet slate of completed work, which leads with a check mark. Neutral by
   * default. A count in the primary tone,
   * solid, draws attention, such as unread messages that need an answer.
   */
  tone?: BadgeTone;
  /**
   * soft tints the background, solid fills it with the tone, outline draws a border.
   * @default 'soft'
   */
  variant?: BadgeVariant;
}

/** A badge with a label. */
interface LabelBadgeProps extends BadgeAppearanceProps {
  /**
   * A decorative icon before the label, such as a check mark; hidden from assistive technology. A
   * done badge has a check mark unless it is given another icon, or `null` for none.
   */
  icon?: ReactNode;
  /**
   * The label: a state, a name or a category in a word or two. It stays on one line and ends with
   * an ellipsis where the badge is wider than its container.
   */
  children: ReactNode;
  count?: undefined;
}

/** A badge with a count. */
interface CountBadgeProps extends BadgeAppearanceProps {
  /**
   * A count, such as 12, or short text such as 99+, in place of a label: a compact round pill, in
   * tabular figures, as beside a navigation label, in a tab or on a button.
   */
  count: number | string;
  /**
   * What the count means, such as 12 unread, which assistive technology reads in place of the
   * number; the number alone otherwise.
   */
  'aria-label'?: string;
  icon?: never;
  children?: never;
}

/** A badge with a label, or with count a compact count. */
export type BadgeProps = LabelBadgeProps | CountBadgeProps;

/**
 * A small pill label for a state, such as In progress, Blocked or Archived, or for neutral metadata,
 * such as a plan or a count of seats; with count, a compact count, such as 12 unread.
 */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  icon,
  count,
  children,
  className,
  ...props
}: BadgeProps) {
  if (count != null) {
    const { 'aria-label': label, ...rest } = props;
    return (
      <span
        {...rest}
        className={classNames('env-badge', className)}
        data-tone={tone}
        data-variant={variant}
        data-count=""
      >
        {label === undefined ? (
          <span className="env-badge-label">{count}</span>
        ) : (
          <>
            <span className="env-badge-label" aria-hidden="true">
              {count}
            </span>
            <span className="env-badge-count-label">{label}</span>
          </>
        )}
      </span>
    );
  }
  return (
    <span
      {...props}
      className={classNames('env-badge', className)}
      data-tone={tone}
      data-variant={variant}
    >
      {icon !== null && (icon !== undefined || tone === 'done') && (
        <DecorativeIcon>{icon ?? <IconCheck />}</DecorativeIcon>
      )}
      <span className="env-badge-label">{children}</span>
    </span>
  );
}
