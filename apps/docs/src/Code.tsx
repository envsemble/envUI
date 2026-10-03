export function Code({
  children,
  language = 'tsx',
  appearance = 'pane',
}: {
  children: string;
  language?: string;
  appearance?: 'pane' | 'plain';
}) {
  return (
    <pre className="docs-code" data-appearance={appearance} aria-label={`${language} example`}>
      <code>{children}</code>
    </pre>
  );
}
