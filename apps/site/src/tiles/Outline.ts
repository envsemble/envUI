import type { CSSProperties } from 'react';

/*
 * A scene's surfaces on its stage: the stage is near-white at rest in the light themes, as the
 * muted surface is, and a shade deeper under the pointer, as the default surface is, so a surface
 * of either fill would vanish into it at one of the two. Each takes the muted border as its edge,
 * through Surface's and Card's public outline color property, as an application sets it, so it
 * shows at rest and as the scene plays.
 */
export const outlined: CSSProperties = {
  '--env-surface-outline': 'var(--env-color-border-muted)',
};
