'use client';

import { useContext } from 'react';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { Checkbox } from '../../Checkbox.js';
import { richText as richTextMessages } from '../../../foundations/messages/richText.js';
import { useMessages } from '../../../internal/EnvUIContext.js';
import { RichTextRenderingContext } from './Reference.js';
import { readOnlyCheckboxProps } from './readOnlyCheckbox.js';
import '../../../styles/Base.css';
// Rich text's rules refine the prose typography, so Prose.css comes first.
import '../../../styles/Prose.css';
import '../../../styles/RichText.css';

/**
 * A task item in the editor: envUI's Checkbox beside the item's text, named by the text, which
 * checks the item; it is read-only, in its colors, while the editor is read-only, and unavailable
 * while it is disabled.
 */
function TaskItemView({ node, updateAttributes, editor }: NodeViewProps) {
  const context = useContext(RichTextRenderingContext);
  const messages = useMessages('richText', richTextMessages);
  const checked = Boolean(node.attrs.checked);
  const disabled = context?.disabled ?? false;
  const readOnly = !disabled && (context?.readOnly ?? !editor.isEditable);
  return (
    <NodeViewWrapper className="env-rich-text-task" data-checked={checked}>
      <span className="env-rich-text-task-check" contentEditable={false}>
        <Checkbox
          checked={checked}
          disabled={disabled}
          {...(readOnly ? readOnlyCheckboxProps : {})}
          aria-label={node.textContent || messages.task}
          onCheckedChange={(next) => updateAttributes({ checked: next })}
        />
      </span>
      <NodeViewContent className="env-rich-text-task-content" />
    </NodeViewWrapper>
  );
}

/** The editor's view of a task item, a list item that holds envUI's Checkbox and the item's text. */
export function createTaskItemNodeView() {
  return ReactNodeViewRenderer(TaskItemView, { as: 'li' });
}
