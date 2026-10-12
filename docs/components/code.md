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
| Code appearance    | dark (default) as below; subtle follows the app theme as a quiet chip                         |
| CodeBlock children | The original source string; whitespace and copying stay intact                                |
| language           | JS/JSX, TS/TSX, Java, JSON, HTML, CSS, SQL, shell, YAML, Markdown, INI; aliases are supported |
| copyable / label   | Optional copy control and source label                                                        |
| wrap               | Wrap long lines; otherwise scroll inside the block                                            |
| theme              | Defaults to GitHub Dark Default in both app themes; optional light or dark override           |
| Native div props   | Root ref, className, style and accessible attributes                                          |

## Guidelines

- Use Code inside prose and CodeBlock for multiline source. Source is selectable and never executed.
- Inline code and code blocks use GitHub Dark Default in both app themes. CodeBlock accepts an explicit light or dark override. Prose and controls retain envUI typography and spacing.
- In prose dense with identifiers, paths and hashes, such as planning records, dark chips dominate the light theme; use `appearance="subtle"` (Markdown `inlineCode="subtle"`) there.
- Highlighting starts after the initial render and shares one runtime. App theme changes leave code colors unchanged; explicit code theme overrides reuse the tokens. Unsupported languages remain plain text.
- Blocks above 50,000 characters or with a line above 2,000 characters stay plain text to avoid expensive highlighting.
- Copy uses the original source. If clipboard access is unavailable, the code is selected for manual copying.

TypeScript declarations provide the complete public API.

## Related topics

- [Markdown](../components/markdown.md)
- [Typography](../foundations/typography.md)
- [Accessibility](../foundations/accessibility.md)
