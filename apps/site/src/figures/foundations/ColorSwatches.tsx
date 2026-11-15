import { Text } from '@envsemble/envui';
import { useContext } from 'react';
import type { FigureWords } from './ColorFigures';
import { FigurePart } from './FoundationFrame';

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

const roleName = (text: string | undefined, index: number) =>
  (text ?? '').replace(/\.$/, '').split(/,\s*/)[index] ?? '';

export function SwatchesFigure({ legend }: FigureWords) {
  return (
    <div className="catalogue-role-groups" data-site-figure={useContext(FigurePart)}>
      <div>
        {roleGroups.map((roles, group) => {
          const title = legend[group]?.name ?? '';
          return (
            <section key={group} className="catalogue-role-group">
              <Text render={<h3 />} variant="title">
                {title}
              </Text>
              <ul className="catalogue-role-swatches" aria-label={title}>
                {roles.map((colors, index) => (
                  <li key={colors.join()}>
                    <span
                      className="catalogue-role-swatch"
                      aria-hidden="true"
                      style={{ '--catalogue-card-fill': `var(--env-color-${colors.at(-1)})` }}
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
