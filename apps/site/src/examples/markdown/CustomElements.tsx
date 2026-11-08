import { Alert } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

const text = `Budgets for the next quarter are due on Friday.

> Spend above the plan needs approval from the finance team.

Send questions to the team channel.`;

export default function CustomElements() {
  return (
    <Markdown
      components={{
        // Quotes in these notes are rules, so they render as an info alert.
        blockquote: ({ node: _node, children }) => <Alert title="Rule">{children}</Alert>,
      }}
    >
      {text}
    </Markdown>
  );
}
