'use client';

import { createContext, useContext } from 'react';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { Button } from '../../actions/Button.js';
import { ActionElement } from '../../internal/ActionElement.js';
import { referenceFromAttributes, safeRichTextUrl } from './ReferenceAttributes.js';
import type { RichTextReference, RichTextRenderOptions } from '../Types.js';

export const RichTextRenderingContext = createContext<
  (RichTextRenderOptions & { readOnly: boolean }) | null
>(null);

export function ReferenceContent({
  reference,
  selected = false,
  readOnly,
  linked = false,
  options,
}: {
  reference: RichTextReference;
  selected?: boolean;
  readOnly: boolean;
  linked?: boolean;
  options: RichTextRenderOptions;
}) {
  const content =
    options.renderReference?.(reference, { readOnly, selected }) ??
    `${reference.char ?? ''}${reference.label}`;
  const className = 'env-rich-text-reference';
  if (linked)
    return (
      <span className={className} data-reference-id={reference.id}>
        {content}
      </span>
    );
  if (reference.href && safeRichTextUrl(reference.href))
    return (
      // A native link, through the LinkProvider's link component, in the reference's own look.
      <ActionElement
        className={className}
        href={reference.href}
        data-reference-id={reference.id}
        onClick={(event) => {
          if (!readOnly) event.preventDefault();
          options.onReferenceClick?.(reference, event);
        }}
      >
        {content}
      </ActionElement>
    );
  if (options.onReferenceClick)
    return (
      <Button
        className={className}
        variant="secondary"
        data-reference-id={reference.id}
        onClick={(event) => options.onReferenceClick?.(reference, event)}
      >
        {content}
      </Button>
    );
  return (
    <span
      className={className}
      data-reference-id={reference.id}
      onClick={(event) => options.onReferenceClick?.(reference, event)}
    >
      {content}
    </span>
  );
}

/**
 * The editor's view of a reference, which renders it with React; Tiptap calls it in the browser
 * only, from the extension that createReferenceExtension builds.
 */
export function createReferenceNodeView(options: RichTextRenderOptions) {
  function ReferenceView({ node, selected, editor }: NodeViewProps) {
    const context = useContext(RichTextRenderingContext);
    return (
      <NodeViewWrapper as="span" contentEditable={false} data-reference-id={node.attrs.id}>
        <ReferenceContent
          reference={referenceFromAttributes(node.attrs)}
          selected={selected}
          readOnly={context?.readOnly ?? !editor.isEditable}
          linked={node.marks.some((mark) => mark.type.name === 'link')}
          options={context ?? options}
        />
      </NodeViewWrapper>
    );
  }
  return ReactNodeViewRenderer(ReferenceView);
}
