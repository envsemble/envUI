import type { CSSProperties } from 'react';

/*
 * The edges of a scene's surfaces on its stage. In the light themes the stage is near-white at
 * rest, as the muted surface is, and a shade deeper under the pointer, as the default surface is,
 * so a surface of either fill would vanish into it in one of the two states. So each surface takes
 * the muted border as its edge, through Surface's and Card's public outline color property, as an
 * application would set it, so the edge shows at rest and while the scene plays.
 */
export const outlined: CSSProperties = {
  '--env-surface-outline': 'var(--env-color-border-muted)',
};
