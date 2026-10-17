/** The stackBelow width whose stacked rules the style sheet carries, ListDetail's default. */
export const defaultStackBelow = '44rem';

// A width that is safe to write into a container query and an attribute selector: a length or a
// calc() of lengths. Anything else stacks once the script has measured it.
const safeLength = /^[\w.%+\-*/(), ]+$/;

/**
 * The rules that stack a layout below its stackBelow width before any script runs: the style sheet
 * carries them for the default width, and this hoisted style for any other. `rules` receives the
 * root's selector for this width, such as `[data-stack-below="30rem"]`. React keeps one style per
 * href, so each width is written once however many layouts use it.
 */
export function StackStyle({
  name,
  stackBelow,
  rules,
}: {
  name: string;
  stackBelow: string;
  rules: (width: string) => string;
}) {
  if (stackBelow === defaultStackBelow || !safeLength.test(stackBelow)) return null;
  // The layer order comes first, as in the style sheet, in case this style lands before it.
  const css =
    '@layer env.reset, env.tokens, env.base, env.components, env.utilities;' +
    `@layer env.components{@container env-split-pane (inline-size < ${stackBelow}){` +
    `${rules(`[data-stack-below="${stackBelow}"]`)}}}`;
  return (
    <style href={`${name}-stack-${stackBelow}`} precedence="env">
      {css}
    </style>
  );
}
