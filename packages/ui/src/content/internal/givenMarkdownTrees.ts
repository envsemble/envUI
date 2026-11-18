export interface MarkdownTree {
  type: 'root';
  children: unknown[];
}

const preParsedTrees = new Map<string, MarkdownTree>();
const renderedDifferentlyEachTime = null;
let renderedTreesBeingCollected:
  Map<string, string | typeof renderedDifferentlyEachTime> | undefined;

export function giveMarkdownTree(source: string, tree: MarkdownTree) {
  preParsedTrees.set(source, tree);
}

export function givenMarkdownTree(source: string): MarkdownTree | undefined {
  const tree = preParsedTrees.get(source);
  const copyRenderingMayChange = tree && structuredClone(tree);
  return copyRenderingMayChange;
}

export const collectingMarkdown = () => renderedTreesBeingCollected !== undefined;

export function noteMarkdownTree(source: string, tree: MarkdownTree) {
  const collected = renderedTreesBeingCollected;
  if (!collected) return;
  const jsonWithoutSourcePositions = JSON.stringify(tree, (key, value: unknown) =>
    key === 'position' ? undefined : value,
  );
  const differsFromAnEarlierRender =
    collected.has(source) && collected.get(source) !== jsonWithoutSourcePositions;
  collected.set(
    source,
    differsFromAnEarlierRender ? renderedDifferentlyEachTime : jsonWithoutSourcePositions,
  );
}

export function collectRenderedMarkdown(): () => [source: string, tree: string][] {
  const collected = new Map<string, string | typeof renderedDifferentlyEachTime>();
  renderedTreesBeingCollected = collected;
  return () => {
    if (renderedTreesBeingCollected === collected) renderedTreesBeingCollected = undefined;
    return [...collected].flatMap(([source, tree]) =>
      tree === renderedDifferentlyEachTime ? [] : [[source, tree]],
    );
  };
}
