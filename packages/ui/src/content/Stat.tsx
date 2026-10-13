import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Surface, type SurfaceAppearanceProps } from '../foundations/Surface.js';
import { TrendingDown } from '../icons/TrendingDown.js';
import { TrendingFlat } from '../icons/TrendingFlat.js';
import { TrendingUp } from '../icons/TrendingUp.js';

export type StatTrendTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface StatTrend {
  /** Which way the figure moved; it chooses the icon and the default tone. */
  direction: 'up' | 'down' | 'flat';
  /** The change in words or signs, such as +12% from last month; it reads well without the icon. */
  label: ReactNode;
  /**
   * Whether the change is good news: up is success, down danger and flat neutral by default. Set it
   * when a rise is bad, as for costs or errors.
   */
  tone?: StatTrendTone;
}

export interface StatProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** What the figure measures, such as Active projects. */
  label: ReactNode;
  /** The figure, such as a formatted number or an AnimatedNumber. */
  value: ReactNode;
  /** A muted line below, such as the period: Last 30 days. */
  detail?: ReactNode;
  /** The change since an earlier period, shown with an icon and text in its tone. */
  trend?: StatTrend;
}

const trendIcons = {
  up: <TrendingUp />,
  down: <TrendingDown />,
  flat: <TrendingFlat />,
};

const trendTones: Record<StatTrend['direction'], StatTrendTone> = {
  up: 'success',
  down: 'danger',
  flat: 'neutral',
};

/** A labelled key figure for a dashboard, with an optional trend and detail. */
export function Stat({ label, value, detail, trend, className, ...props }: StatProps) {
  return (
    <div {...props} className={classNames('env-stat', className)}>
      <div className="env-stat-label">{label}</div>
      <div className="env-stat-value">{value}</div>
      {(trend != null || detail != null) && (
        <div className="env-stat-footer">
          {trend != null && (
            <span
              className="env-stat-trend"
              data-direction={trend.direction}
              data-tone={trend.tone ?? trendTones[trend.direction]}
            >
              <DecorativeIcon>{trendIcons[trend.direction]}</DecorativeIcon>
              <span>{trend.label}</span>
            </span>
          )}
          {detail != null && <span className="env-stat-detail">{detail}</span>}
        </div>
      )}
    </div>
  );
}

export interface StatGroupProps
  extends ComponentPropsWithRef<'div'>,
    Pick<SurfaceAppearanceProps, 'tone' | 'padding'> {}

/**
 * Stats on one surface, a pane by default, in as many even columns as fit; they wrap as space runs
 * out. Use the row tone for a group on a pane. A group named with aria-label or aria-labelledby is
 * exposed as a group, so assistive technology announces the name.
 */
export function StatGroup({ tone = 'pane', padding, className, ...props }: StatGroupProps) {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
  return (
    <Surface
      role={labelled ? 'group' : undefined}
      {...props}
      tone={tone}
      padding={padding}
      className={classNames('env-stat-group', className)}
    />
  );
}
