import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Text } from '../foundations/Text.js';
import { Stack } from '../foundations/Layout.js';
import { Card } from './Card.js';

export interface FeatureCardProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** A decorative icon at the start, 1.5 rem in the muted color; hidden from assistive technology. */
  icon?: ReactNode;
  /** The feature's name, an `h2` in the page heading type. */
  title: ReactNode;
  /** A sentence under the title in supporting text. */
  description?: ReactNode;
  /** One control at the end, such as a Button; it moves below the text and fills the card's width in a card narrower than 38 rem. */
  action?: ReactNode;
}

/** A card that presents a feature: an icon, a title, a description and one action. */
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
    <Card {...props} className={classNames('env-feature-card', className)}>
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
