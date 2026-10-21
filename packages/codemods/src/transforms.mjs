// The codemods the CLI runs, with the files each one reads by default, in the order they run:
// v1-names reads 0.x names before 1.0 reuses one (Row), v1-structure writes the Stacks that v1-stack
// rewrites, v1-render turns `as` into `render` while the element is still a Stack, and v1-classes
// reads the style sheets last. Running them all again changes nothing.
import { fileURLToPath } from 'node:url';

const scripts = ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'mts', 'cts'];
const styleSheets = ['css', 'scss', 'sass', 'less', 'pcss'];

export const transforms = {
  'v1-names': {
    file: fileURLToPath(new URL('./transforms/v1-names.mjs', import.meta.url)),
    description:
      'Move imports from envUI 0.x to their 1.0 names: renamed exports, namespace parts, the DirectionLink split and removed exports.',
    extensions: scripts,
  },
  'v1-structure': {
    file: fileURLToPath(new URL('./transforms/v1-structure.mjs', import.meta.url)),
    description:
      'Rewrite elements whose 1.0 form is another element or shape, such as ActionGroup, which becomes a Stack for v1-stack to rewrite; what cannot be rewritten is reported.',
    extensions: scripts,
  },
  'v1-render': {
    file: fileURLToPath(new URL('./transforms/v1-render.mjs', import.meta.url)),
    description:
      'Replace the as prop with render: as="h2" becomes render={<h2 />}; an expression is reported.',
    extensions: scripts,
  },
  'v1-stack': {
    file: fileURLToPath(new URL('./transforms/v1-stack.mjs', import.meta.url)),
    description:
      'Rewrite Stack into the layout primitives: direction="row" becomes a Row, any other Stack a Column, with gap={4} where it set none; a direction that is an expression is reported.',
    extensions: scripts,
  },
  'v1-props': {
    file: fileURLToPath(new URL('./transforms/v1-props.mjs', import.meta.url)),
    description:
      'Move the props 1.0 removed, renamed or changed, such as variant="important" to variant="primary" tone="accent" and Text tone to emphasis, and the properties of objects that calls such as useToast().show take; what cannot move is reported.',
    extensions: scripts,
  },
  'v1-classes': {
    file: fileURLToPath(new URL('./transforms/v1-classes.mjs', import.meta.url)),
    description:
      'Rename envUI 0.x class names and custom properties in style sheets, className values and selector strings, and turn modifier classes into attribute selectors.',
    extensions: [...scripts, ...styleSheets],
  },
};
