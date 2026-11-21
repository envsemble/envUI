import type { ComponentProps } from 'react';
import type { Card, NavigationBackground, Surface } from '@envsemble/envui';

type SurfaceFill = NonNullable<ComponentProps<typeof Surface>['background']>;
type CardFill = NonNullable<ComponentProps<typeof Card>['background']>;

const surfaceFill = <Fill extends SurfaceFill>(fill: Fill) => fill;

export const navigationFillsAreSurfaceFills = (fill: NavigationBackground) => surfaceFill(fill);
export const cardFillsAreSurfaceFills = (fill: CardFill) => surfaceFill(fill);
