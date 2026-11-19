'use client';

import { useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Markdown, type MarkdownProps } from '../../Markdown.js';
import { Text } from '../../../foundations/Text.js';

type PreviewOptions = Omit<MarkdownProps, 'children' | keyof ComponentPropsWithRef<'div'>>;

function sameOptions(before: PreviewOptions, after: PreviewOptions) {
  const names = new Set([...Object.keys(before), ...Object.keys(after)]) as Set<
    keyof PreviewOptions
  >;
  return [...names].every((name) => before[name] === after[name]);
}

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
    !sameOptions(retainedPreview.options, options);
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
