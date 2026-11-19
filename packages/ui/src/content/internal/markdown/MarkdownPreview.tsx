'use client';

import { useState, type ReactNode } from 'react';
import { Markdown, type MarkdownProps } from '../../Markdown.js';
import { Text } from '../../../foundations/Text.js';

const previewOptionNames = [
  'headingOffset',
  'renderLink',
  'codeCopyable',
  'components',
  'remarkPlugins',
  'rehypePlugins',
  'allowHtml',
] as const;

type PreviewOptions = Pick<MarkdownProps, (typeof previewOptionNames)[number]>;

interface RetainedPreview {
  source: string;
  options: PreviewOptions;
  content: ReactNode;
}

export function MarkdownPreview({
  active,
  source,
  empty,
  ...options
}: PreviewOptions & { active: boolean; source: string; empty: string }) {
  const [retainedPreview, setRetainedPreview] = useState<RetainedPreview | null>(null);
  const retainedPreviewOutdated =
    retainedPreview === null ||
    retainedPreview.source !== source ||
    previewOptionNames.some((name) => retainedPreview.options[name] !== options[name]);
  if (active && retainedPreviewOutdated) {
    setRetainedPreview({
      source,
      options,
      content: source.trim() ? (
        <Markdown {...options}>{source}</Markdown>
      ) : (
        <Text emphasis="muted">{empty}</Text>
      ),
    });
  }
  return retainedPreview?.content ?? null;
}
