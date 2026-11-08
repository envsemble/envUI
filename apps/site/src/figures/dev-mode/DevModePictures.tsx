import type { CSSProperties } from 'react';
import { Column, IconButton, Surface, Text, useTheme } from '@envsemble/envui';
import { IconViewInAr } from '@envsemble/envui/icons/ViewInAr';
import { Figure } from '../foundations/Topic';
// Pictures of the real dev mode at work on the demo application, captured by
// scripts/docs/CaptureDevModeImage.ts (npm run docs:dev-mode-image) in each theme.
import wholeLight from './dev-mode-whole-light.webp';
import wholeDark from './dev-mode-whole-dark.webp';
import toolbarLight from './dev-mode-toolbar-light.webp';
import toolbarDark from './dev-mode-toolbar-dark.webp';
import inspectorLight from './dev-mode-inspector-light.webp';
import inspectorDark from './dev-mode-inspector-dark.webp';
import spacingLight from './dev-mode-spacing-light.webp';
import spacingDark from './dev-mode-spacing-dark.webp';
import problemsLight from './dev-mode-problems-light.webp';
import problemsDark from './dev-mode-problems-dark.webp';
import frameLight from './dev-mode-frame-light.webp';
import frameDark from './dev-mode-frame-dark.webp';

/**
 * The pictures the dev mode guide places beside its words, each a figure of its own
 * (DevModeFigures.ts). None of them loads `@envsemble/envui/dev`.
 */

/** A picture of dev mode in each theme, with its size in CSS pixels: the files hold twice as many. */
interface Shot {
  light: string;
  dark: string;
  width: number;
  height: number;
  label: string;
  alt: string;
  caption: string;
}

const shots = {
  whole: {
    light: wholeLight,
    dark: wholeDark,
    width: 1280,
    height: 800,
    label: 'Dev mode open over an application',
    alt: 'Dev mode open over a small application: the list of its boxes on the left, its layers tilted in the middle with one card selected, and the details of that card on the right.',
    caption:
      'The node tree on one side, the 3D view in the middle and the inspector on the other. Resting on a node in the tree lights up its plane.',
  },
  toolbar: {
    light: toolbarLight,
    dark: toolbarDark,
    width: 304,
    height: 157,
    label: "Dev mode's toolbar",
    alt: "Dev mode's toolbar of four dropdowns, the first open: the view's angles laid out as they look at the page, Top above Front, Left and Right beside it, and Tilted in the top right corner.",
    caption:
      "The toolbar's four dropdowns, View open: the angles laid out as they look at the page.",
  },
  inspector: {
    light: inspectorLight,
    dark: inspectorDark,
    width: 352,
    height: 329,
    label: 'The details of a selected card',
    alt: 'The details of a selected card: what it is, its size and window class, and its one problem in red, a sentence saying its text is squeezed and how to give it room.',
    caption:
      'The details of the selected node: what it is, its size and window class, and its problem, with how to fix it.',
  },
  spacing: {
    light: spacingLight,
    dark: spacingDark,
    width: 223,
    height: 211,
    label: "A card's padding and gaps",
    alt: 'One card alone, close up and tilted: the padding around its content and the gaps between its parts are hatched.',
    caption:
      'Uneven spacing: padding and gaps are hatched, so one wider or narrower than its neighbours shows at a glance.',
  },
  problems: {
    light: problemsLight,
    dark: problemsDark,
    width: 256,
    height: 698,
    label: 'The list of boxes with their problems',
    alt: 'The list of the boxes of a page, headed by six problems: each card and its header is marked with one.',
    caption:
      'Squeezed or spilling content: a node with problems is outlined in red, and the tree counts them.',
  },
  frame: {
    light: frameLight,
    dark: frameDark,
    width: 362,
    height: 668,
    label: "The application at a phone's size",
    alt: "The application laid out at a phone's size, inside a frame with handles on its edges: its three columns of cards are outlined in red, their words broken over many short lines.",
    caption:
      "A layout that breaks at a width: at a phone's size, three fixed columns squeeze the cards' words onto short lines.",
  },
} satisfies Record<string, Shot>;

/** One picture of dev mode at work, in the reader's theme, on the recessed canvas. */
function ShotFigure({ shot }: { shot: Shot }) {
  const { theme } = useTheme();
  return (
    <Figure label={shot.label} caption={shot.caption}>
      <img
        className="docs-dev-mode-shot"
        src={theme === 'dark' ? shot.dark : shot.light}
        // The file holds twice the CSS size: the picture shows at its own size, or narrower.
        style={{ '--docs-shot-width': `${shot.width / 16}rem` } as CSSProperties}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
      />
    </Figure>
  );
}

export const DevModeWholePicture = () => <ShotFigure shot={shots.whole} />;
export const DevModeToolbarPicture = () => <ShotFigure shot={shots.toolbar} />;
export const DevModeInspectorPicture = () => <ShotFigure shot={shots.inspector} />;
export const DevModeSpacingPicture = () => <ShotFigure shot={shots.spacing} />;
export const DevModeProblemsPicture = () => <ShotFigure shot={shots.problems} />;
export const DevModeFramePicture = () => <ShotFigure shot={shots.frame} />;

/**
 * The dev mode button as an application shows it while it is being built: round, in the bottom
 * corner of the page. A picture, so it takes no focus.
 */
export function DevModeButtonPicture() {
  return (
    <Figure
      label="The dev mode button in the corner of a page"
      caption="The Dev mode button, in the bottom corner of a page being built: it opens dev mode in a new tab."
    >
      <Surface
        background="default"
        padding={5}
        radius="xl"
        className="docs-dev-mode-corner"
        render={<Column gap={2} />}
        inert
      >
        <Text render={<p />} variant="title">
          Projects
        </Text>
        <Text render={<p />} emphasis="muted">
          Three projects, two of them updated today.
        </Text>
        <IconButton
          variant="secondary"
          icon={<IconViewInAr />}
          aria-label="Dev mode"
          className="docs-dev-mode-button"
        />
      </Surface>
    </Figure>
  );
}
