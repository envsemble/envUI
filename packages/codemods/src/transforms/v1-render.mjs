// v1-render: replaces the `as` prop of envUI 0.x components with 1.0's `render`, as the rename
// map's `render` section lists the components.
//
// - `<Text as="h2">` becomes `<Text render={<h2 />}>`, in the prop's place among the attributes;
//   only the attribute's text changes, so the file keeps its layout.
// - An expression, such as `as={level}`, stays as it is and is reported: render takes an element,
//   such as `render={<Heading />}`, which the codemod can't build from a value.
// - A value the map lists under `except`, such as a Card's `as="button"`, stays and is reported
//   with the entry's text, and so does an `as` beside a `render` the element already has.
// - An element that also spreads props gets its render, and a report: the spread may set as or
//   render too, which the codemod can't see.
// Elements are matched by their import from @envsemble/envui, as v1-props matches them.
import { loadMap } from '../map.mjs';
import { componentResolver, envuiImports, literalKey } from '../elements.mjs';
import { createReporter, parserFor, sourceRanges } from '../shared.mjs';

export const parser = 'tsx';

/** An intrinsic element name, such as h2 or article, which JSX writes in lower case. */
const intrinsic = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export default function transform(file, api, options = {}) {
  const { entries } = loadMap(options.map);
  if (![...entries.keys()].some((entry) => file.source.includes(entry))) return undefined;

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const reporter = createReporter(api);
  const imports = envuiImports(j, root, entries);
  if (imports.components.size === 0 && imports.namespaceImports.size === 0) return undefined;
  const componentOf = componentResolver(imports);

  // Each rewrite replaces one attribute's text: printing a changed element again, as recast does,
  // can move the text of a parenthesized element's children.
  const edits = [];
  // Where each attribute's text is: recast's lines and columns aren't offsets in the text.
  const rangeOf = sourceRanges(file, j, root, 'JSXAttribute');
  root.find(j.JSXOpeningElement).forEach((path) => {
    const component = componentOf(path);
    const rule = component && component.entry.render.get(component.name);
    if (!rule) return;
    const { attributes } = path.node;
    const index = attributes.findIndex(
      (node) => node.type === 'JSXAttribute' && node.name.name === rule.prop,
    );
    if (index === -1) return;
    const node = attributes[index];
    const where = `${component.name}'s ${rule.prop}`;
    if (attributes.some((each) => each.type === 'JSXAttribute' && each.name.name === 'render')) {
      reporter.warn(
        node,
        `${where} is gone in 1.0, and the element already sets render: remove it.`,
      );
      return;
    }
    const value = literalKey(node.value);
    if (value !== undefined && Object.hasOwn(rule.except, value)) {
      reporter.warn(node, `${where}="${value}": ${rule.except[value]}`);
      return;
    }
    if (value === undefined || !intrinsic.test(value)) {
      reporter.warn(
        node,
        `${where} is gone in 1.0: pass the element to render instead, such as render={<h2 />}.`,
      );
      return;
    }
    const range = rangeOf(node);
    if (!range) {
      reporter.warn(node, `${where} is gone in 1.0: change it to render={<${value} />} by hand.`);
      return;
    }
    edits.push({ ...range, text: `render={<${value} />}` });
    if (attributes.some((each) => each.type === 'JSXSpreadAttribute'))
      reporter.warn(
        node,
        `${where}="${value}" is render={<${value} />} now, and the element spreads props too: check they set neither as nor render.`,
      );
  });

  reporter.flush();
  if (edits.length === 0) return undefined;
  let output = file.source;
  for (const { start, end, text } of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, start) + text + output.slice(end);
  return output;
}
