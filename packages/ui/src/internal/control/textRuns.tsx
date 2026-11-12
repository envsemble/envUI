import { Children, isValidElement, type ReactNode } from 'react';

/** Components that render a run of text, such as AnimatedNumber, which a label keeps in its line. */
const textComponents = new WeakSet<object>();

/**
 * Marks a component as a run of text, such as a number within a sentence: in a button's label it
 * stays in the line with the words around it rather than standing apart as an item of its own.
 */
export function runsInText(component: object) {
  textComponents.add(component);
}

/** The HTML elements that run in a line of text. */
const phrasing = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'i',
  'ins',
  'kbd',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',
]);

const isText = (child: ReactNode) => typeof child === 'string' || typeof child === 'number';

const runsInLine = (child: ReactNode) =>
  isText(child) ||
  (isValidElement(child) &&
    (typeof child.type === 'string' ? phrasing.has(child.type) : textComponents.has(child.type)));

/**
 * A flex container's children with each run of text and the elements in its line, such as "Show",
 * an AnimatedNumber and "tasks", wrapped in one element of the class given, so the run reads as
 * one line of words: the container's gap would otherwise stand between them as wide spaces. Other
 * children, such as a Badge, stay items of their own; children with no such run come back as they
 * are.
 */
export function textRuns(children: ReactNode, className: string): ReactNode {
  const items = Children.toArray(children);
  if (!items.some((item) => !isText(item) && runsInLine(item))) return children;
  const result: ReactNode[] = [];
  let run: ReactNode[] = [];
  const close = () => {
    // A run of words alone is one item already; only words with an element in their line need it.
    if (run.some(isText) && run.some((item) => !isText(item)))
      result.push(
        <span key={`text-run-${result.length}`} className={className}>
          {run}
        </span>,
      );
    else result.push(...run);
    run = [];
  };
  for (const item of items) {
    if (runsInLine(item)) run.push(item);
    else {
      close();
      result.push(item);
    }
  }
  close();
  return result;
}
