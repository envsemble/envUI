import type { ReactNode } from 'react';
import { Icon } from '../../foundations/Icon.js';

const frontCube = {
  depthUpRight: { outline: 'M3 9h12v12H3zM3 9l6-6h12l-6 6M21 3v12l-6 6', front: 'M3 9h12v12H3z' },
  depthUpLeft: { outline: 'M9 9h12v12H9zM21 9l-6-6H3l6 6M3 3v12l6 6', front: 'M9 9h12v12H9z' },
};
const faces = {
  top: 'M3 9l6-6h12l-6 6z',
  right: 'M15 9l6-6v12l-6 6z',
  left: 'M9 9L3 3v12l6 6z',
};

const UnfilledStrokes = ({ children }: { children: ReactNode }) => (
  <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
    {children}
  </g>
);

function CubeIcon({ outline, face }: { outline: string; face?: ReactNode }) {
  return (
    <Icon viewBox="0 0 24 24">
      {face}
      <UnfilledStrokes>
        <path d={outline} />
      </UnfilledStrokes>
    </Icon>
  );
}

const ViewedFace = ({ d }: { d: string }) => <path d={d} fill="currentColor" stroke="none" />;

export const ViewTilted = () => (
  <Icon viewBox="0 0 24 24">
    <UnfilledStrokes>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />
    </UnfilledStrokes>
  </Icon>
);
export const ViewFront = () => (
  <CubeIcon
    outline={frontCube.depthUpRight.outline}
    face={<ViewedFace d={frontCube.depthUpRight.front} />}
  />
);
export const ViewTop = () => (
  <CubeIcon outline={frontCube.depthUpRight.outline} face={<ViewedFace d={faces.top} />} />
);
export const ViewLeft = () => (
  <CubeIcon outline={frontCube.depthUpLeft.outline} face={<ViewedFace d={faces.left} />} />
);
export const ViewRight = () => (
  <CubeIcon outline={frontCube.depthUpRight.outline} face={<ViewedFace d={faces.right} />} />
);
