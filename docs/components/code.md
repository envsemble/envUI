# Code

## React usage

```tsx
import { Text } from '@envsemble/envui';
import { Code, CodeBlock } from '@envsemble/envui/content';

<Text>Use <Code>npm run build</Code> to build the application.</Text>
<CodeBlock language="tsx" copyable>{source}</CodeBlock>
```

### Props & contracts

| Name               | Contract                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Code               | Native code attributes and inline content                                                     |
| CodeBlock children | The original source string; whitespace and copying stay intact                                |
| language           | JS/JSX, TS/TSX, Java, JSON, HTML, CSS, SQL, shell, YAML, Markdown, INI; aliases are supported |
| copyable / label   | Optional copy control, a quiet icon button, and source label                                  |
| wrap               | Wrap long lines; otherwise scroll inside the block                                            |
| Native div props   | Root ref, className, style and accessible attributes                                          |

## Guidelines

- Use Code inside prose and CodeBlock for multiline source. Source is selectable and never executed.
- Inline code, code blocks and code diffs use the Pierre code themes, the ones Diffs uses: Pierre Light in the light app theme, on its own sidebar grey so code stands out on the white canvas, and Pierre Dark in the dark one. envUI chooses the code theme; applications do not set it. Prose and controls retain envUI typography and spacing.
- Highlighting starts after the initial render and shares one runtime; tokens carry both code themes, so an app theme change recolors code without highlighting it again. Unsupported languages remain plain text.
- Blocks above 50,000 characters or with a line above 2,000 characters stay plain text to avoid expensive highlighting.
- Copy uses the original source. If clipboard access is unavailable, the code is selected for manual copying.

## Code diffs

```tsx
import { CodeDiff, countDiffLines } from '@envsemble/envui/diff';

<CodeDiff before={savedSource} after={draftSource} filename="form.json" />;

const { additions, deletions } = countDiffLines(savedSource, draftSource);
```

| Name             | Contract                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| before / after   | The two versions of the file; the whole file shows when they are the same                       |
| filename         | Names the file in the header and chooses its language, such as form.json                        |
| language         | Overrides the language the file name implies                                                    |
| header           | Shows the file header with its name and change counts; true by default                          |
| expandUnchanged  | Shows the unchanged lines between changes instead of folding them                               |
| layout           | auto (default) sets old and new side by side from 56 rem of the diff's width; unified keeps one |
| countDiffLines   | The added and removed lines between two versions, for a DiffCount                               |
| Native div props | className, style, ref and accessible attributes on the root                                     |

- CodeDiff renders with [Diffs](https://diffs.com) (`@pierre/diffs`), an optional peer installed with the `@envsemble/envui/diff` entry. CodeBlock's highlighting is for snippets; diffs use Diffs.
- The diff uses Diffs' own Pierre theme for the app theme, as code blocks do; applications do not choose its colors.
- Long lines wrap. While the highlighter loads, the diff shows a loading state; if it fails, an error state offers Retry.

TypeScript declarations provide the complete public API.

## Related topics

- [Markdown](../components/markdown.md)
- [Typography](../foundations/typography.md)
- [Accessibility](../foundations/accessibility.md)
