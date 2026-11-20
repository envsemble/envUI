import parser from 'postcss-selector-parser';

export interface Compound {
  classes: string[];
  combinator: string;
}

const pseudosNamingOtherElements = new Set([':not', ':has']);

function classesIn(node: parser.Node): string[] {
  if (parser.isClassName(node)) return [node.value];
  if (parser.isPseudo(node) && pseudosNamingOtherElements.has(node.value.toLowerCase())) return [];
  return parser.isContainer(node) ? node.nodes.flatMap(classesIn) : [];
}

function parseSelector(selector: string) {
  return parser().astSync(selector);
}

export function compoundsOf(selector: string): Compound[] {
  const compounds: Compound[] = [];
  for (const complex of parseSelector(selector).nodes) {
    let current: parser.Node[] = [];
    for (const node of complex.nodes) {
      if (!parser.isCombinator(node)) {
        if (!parser.isComment(node)) current.push(node);
        continue;
      }
      if (current.length)
        compounds.push({
          classes: current.flatMap(classesIn),
          combinator: node.value.trim() || ' ',
        });
      current = [];
    }
    if (current.length) compounds.push({ classes: current.flatMap(classesIn), combinator: '' });
  }
  return compounds;
}
