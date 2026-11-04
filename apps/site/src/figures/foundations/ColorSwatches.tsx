import type { CSSProperties } from 'react';
import { Text } from '@envsemble/envui';
import type { FigureWords } from './ColorFigures';

/**
 * The colors of each role, in four groups: seven surfaces, six text and line roles, six actions and seven statuses, in the
 * legend's order: each group is a legend entry, its name the group's and its text the names of its
 * roles, separated by commas. A status shows its three colors in one swatch: its text, its soft fill
 * and its solid fill.
 */
const roleGroups: readonly (readonly (readonly string[])[])[] = [
  [
    ['bg-page'],
    ['bg-recessed'],
    ['bg-default'],
    ['bg-muted'],
    ['bg-raised'],
    ['bg-field'],
    ['bg-backdrop'],
  ],
  [
    ['fg-default'],
    ['fg-muted'],
    ['fg-link'],
    ['border-default'],
    ['border-muted'],
    ['border-focus'],
  ],
  [
    ['bg-primary-emphasis'],
    ['fg-on-emphasis'],
    ['bg-neutral-muted'],
    ['bg-accent-strong'],
    ['bg-selected'],
    ['fg-on-selected'],
  ],
  [
    ['fg-muted', 'bg-neutral-muted', 'bg-neutral-emphasis'],
    ['fg-primary', 'bg-primary-soft', 'bg-primary-solid'],
    ['fg-accent', 'bg-accent-soft', 'bg-accent-solid'],
    ['fg-success', 'bg-success-muted', 'bg-success-emphasis'],
    ['fg-warning', 'bg-warning-muted', 'bg-warning-emphasis'],
    ['fg-danger', 'bg-danger-muted', 'bg-danger-emphasis'],
    ['fg-done', 'bg-done-muted', 'bg-done-emphasis'],
  ],
];

/** A role's name from a group's legend text, "Page, Surface, Filled surface…", by its place. */
const roleName = (text: string | undefined, index: number) =>
  (text ?? '').replace(/\.$/, '').split(/,\s*/)[index] ?? '';

/** The roles in the reader's theme, each group a continuous strip of swatches: a specimen of the system. */
export function SwatchesFigure({ legend }: FigureWords) {
  return (
    <div className="catalogue-role-groups">
      <div>
        {roleGroups.map((roles, group) => {
          const title = legend[group]?.name ?? '';
          return (
            <section key={group} className="catalogue-role-group">
              <Text render={<h4 />} variant="title">
                {title}
              </Text>
              <ul className="catalogue-role-swatches" aria-label={title}>
                {roles.map((colors, index) => (
                  <li key={colors.join()}>
                    <span
                      className="catalogue-role-swatch"
                      aria-hidden="true"
                      style={
                        {
                          '--catalogue-card-fill': `var(--env-color-${colors.at(-1)})`,
                        } as CSSProperties
                      }
                    >
                      {colors.map((color) => (
                        <span key={color} style={{ background: `var(--env-color-${color})` }} />
                      ))}
                    </span>
                    <Text render={<span />} className="catalogue-topic-legend-name">
                      {roleName(legend[group]?.text, index)}
                    </Text>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
