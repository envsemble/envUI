import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import {
  Surface,
  type SurfaceAppearanceProps,
  type SurfaceBackground,
} from '../foundations/Surface.js';
import { TrendingDown } from '../icons/TrendingDown.js';
import { TrendingFlat } from '../icons/TrendingFlat.js';
import { TrendingUp } from '../icons/TrendingUp.js';
import { withDisplayName } from '../internal/withDisplayName.js';

export type TrendTone = 'neutral' | 'success' | 'warning' | 'danger';

/** How a figure changed since an earlier period, shown as a direction icon and text in a tone. */
export interface Trend {
  /** Which way the figure moved: up, down or flat. It chooses the icon and the default tone. */
  direction: 'up' | 'down' | 'flat';
  /**
   * The change in words or signs, such as +12% from last month or 2 fewer than last week. The icon
   * is hidden from assistive technology, so the text says which way the figure moved.
   */
  label: ReactNode;
  /**
   * Whether the change is good news: success, warning, danger or neutral. Set it when a rise is bad,
   * as for costs or errors, or a fall is good.
   * @default 'success' when up, 'danger' when down, 'neutral' when flat
   */
  tone?: TrendTone;
}

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** What the figure measures, such as Active projects, in muted text above it. */
  label: ReactNode;
  /**
   * The figure, formatted by the application with its unit, such as 1,284 or 2.5 days, or an
   * AnimatedNumber that rolls to new values. It shows large, in tabular digits.
   */
  value: ReactNode;
  /** A muted note below the figure, after the trend, such as the period: Last 30 days. */
  description?: ReactNode;
  /**
   * The change since an earlier period, such as up and +12% from last month, shown below the figure
   * as a direction icon and text in its tone.
   */
  trend?: Trend;
}

const trendIcons = {
  up: <TrendingUp />,
  down: <TrendingDown />,
  flat: <TrendingFlat />,
};

const trendTones: Record<Trend['direction'], TrendTone> = {
  up: 'success',
  down: 'danger',
  flat: 'neutral',
};

/**
 * A labelled key figure for a dashboard, such as Active projects 128, with an optional trend and
 * description. It has no surface of its own; Stat.Group puts several on one, or a Card holds one.
 */
function Root({ label, value, description, trend, className, ...props }: RootProps) {
  return (
    <div {...props} className={classNames('env-stat', className)}>
      <div className="env-stat-label">{label}</div>
      <div className="env-stat-value">{value}</div>
      {(trend != null || description != null) && (
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
          {description != null && <span className="env-stat-description">{description}</span>}
        </div>
      )}
    </div>
  );
}

export interface GroupProps extends ComponentPropsWithRef<'div'> {
  /**
   * The group's fill, as for Surface: default on the page, or muted for a group on a pane, so its
   * stats stand apart; page or raised where those fit.
   * @default 'default'
   */
  background?: SurfaceBackground;
  /**
   * The inset on every side, as a step of the spacing scale, such as 4 for 1 rem; 0 removes it.
   * Without it, the inset follows the window's width, as for Surface.
   * @default 1.25 rem in narrow windows, growing to 1.5 rem from 50 rem wide
   */
  padding?: SurfaceAppearanceProps['padding'];
}

/**
 * Stats on one surface, a pane's fill by default, in as many even columns as fit; they wrap as
 * space runs out. Use the muted background for a group on a pane. A group named with aria-label or
 * aria-labelledby is exposed as a group, so assistive technology announces the name.
 */
function Group({ background = 'default', padding, className, ...props }: GroupProps) {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
  return (
    <Surface
      role={labelled ? 'group' : undefined}
      {...props}
      background={background}
      padding={padding}
      className={classNames('env-stat-group', className)}
    />
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Stat.Root');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'Stat.Group');
export { RootPart as Root, GroupPart as Group };
