'use client';

import { useState, type ReactNode } from 'react';
import { Markdown, type MarkdownProps } from '../../Markdown.js';
import { Text } from '../../../foundations/Text.js';

type PreviewOptions = Pick<MarkdownProps, 'headingOffset' | 'renderLink' | 'codeCopyable'>;

interface RetainedPreview extends PreviewOptions {
  source: string;
  content: ReactNode;
}

export function MarkdownPreview({
  active,
  source,
  headingOffset,
  renderLink,
  codeCopyable,
  empty,
}: PreviewOptions & { active: boolean; source: string; empty: string }) {
  const [retainedPreview, setRetainedPreview] = useState<RetainedPreview | null>(null);
  const retainedPreviewOutdated =
    retainedPreview === null ||
    retainedPreview.source !== source ||
    retainedPreview.headingOffset !== headingOffset ||
    retainedPreview.renderLink !== renderLink ||
    retainedPreview.codeCopyable !== codeCopyable;
  if (active && retainedPreviewOutdated) {
    setRetainedPreview({
      source,
      headingOffset,
      renderLink,
      codeCopyable,
      content: source.trim() ? (
        <Markdown headingOffset={headingOffset} renderLink={renderLink} codeCopyable={codeCopyable}>
          {source}
        </Markdown>
      ) : (
        <Text emphasis="muted">{empty}</Text>
      ),
    });
  }
  return retainedPreview?.content ?? null;
}
