export function Code({ children, language = 'tsx' }: { children: string; language?: string }) {
  return (
    <pre className="docs-code" aria-label={`${language} example`}>
      <code>{children}</code>
    </pre>
  );
}
