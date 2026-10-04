import { useState, type ReactNode } from 'react';
import { Markdown, type MarkdownProps } from '../../../content/Markdown.js';
import { Text } from '../../../foundations/Text.js';

type PreviewOptions = Pick<MarkdownProps, 'headingOffset' | 'renderLink' | 'codeCopyable'>;

interface PreviewSnapshot extends PreviewOptions {
  source: string;
  content: ReactNode;
}

/** Defer the first preview, then retain its mounted state without parsing inactive edits. */
export function MarkdownPreview({
  active,
  source,
  headingOffset,
  renderLink,
  codeCopyable,
}: PreviewOptions & { active: boolean; source: string }) {
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null);
  if (
    active &&
    (snapshot === null ||
      snapshot.source !== source ||
      snapshot.headingOffset !== headingOffset ||
      snapshot.renderLink !== renderLink ||
      snapshot.codeCopyable !== codeCopyable)
  ) {
    // Adjust this component's own state during render so activation commits current content.
    // Returning the same element while inactive preserves custom links and code-block state.
    setSnapshot({
      source,
      headingOffset,
      renderLink,
      codeCopyable,
      content: source.trim() ? (
        <Markdown headingOffset={headingOffset} renderLink={renderLink} codeCopyable={codeCopyable}>
          {source}
        </Markdown>
      ) : (
        <Text tone="muted">Nothing to preview.</Text>
      ),
    });
  }
  return snapshot?.content ?? null;
}
