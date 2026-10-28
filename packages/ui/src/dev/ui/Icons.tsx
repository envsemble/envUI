// Dev mode's own icons, for the 3D view's toolbar: a cube for each view direction, with the face the
// view looks at filled, as the standard views of a 3D modelling program draw them, a cube seen
// from a corner for the tilted view, and a fit icon.
// Line icons on a 24-unit grid with a 2-unit stroke, as heavy as envUI's icons at the same size.
// They belong to dev mode alone and are not exported.

import type { ReactNode } from 'react';
import { Icon } from '../../Icon.js';

/** The cube seen from the front, its depth going up to the right, or up to the left when mirrored. */
const cube = {
  right: { outline: 'M3 9h12v12H3zM3 9l6-6h12l-6 6M21 3v12l-6 6', front: 'M3 9h12v12H3z' },
  left: { outline: 'M9 9h12v12H9zM21 9l-6-6H3l6 6M3 3v12l6 6', front: 'M9 9h12v12H9z' },
};
const faces = {
  top: 'M3 9l6-6h12l-6 6z',
  right: 'M15 9l6-6v12l-6 6z',
  left: 'M9 9L3 3v12l6 6z',
};

/**
 * The lines of an icon. They are set on a group, not on the svg, whose fill envUI's icon styles
 * set to the text color.
 */
const Lines = ({ children }: { children: ReactNode }) => (
  <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
    {children}
  </g>
);

function CubeIcon({ outline, face }: { outline: string; face?: ReactNode }) {
  return (
    <Icon viewBox="0 0 24 24">
      {face}
      <Lines>
        <path d={outline} />
      </Lines>
    </Icon>
  );
}

/** A filled face: the side of the cube the view looks at. */
const Face = ({ d }: { d: string }) => <path d={d} fill="currentColor" stroke="none" />;

/** The tilted view: the cube seen from a corner, its three faces in view. */
export const ViewTilted = () => (
  <Icon viewBox="0 0 24 24">
    <Lines>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />
    </Lines>
  </Icon>
);
/** Straight on: looking at the front. */
export const ViewFront = () => (
  <CubeIcon outline={cube.right.outline} face={<Face d={cube.right.front} />} />
);
/** From the top. */
export const ViewTop = () => (
  <CubeIcon outline={cube.right.outline} face={<Face d={faces.top} />} />
);
/** From the left: the cube mirrored, so its left side is in view. */
export const ViewLeft = () => (
  <CubeIcon outline={cube.left.outline} face={<Face d={faces.left} />} />
);
/** From the right. */
export const ViewRight = () => (
  <CubeIcon outline={cube.right.outline} face={<Face d={faces.right} />} />
);
