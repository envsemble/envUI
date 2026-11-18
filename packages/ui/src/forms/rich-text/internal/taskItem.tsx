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
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import { RichTextRenderingContext } from './Reference.js';
import { readOnlyCheckboxProps } from './readOnlyCheckbox.js';
import '../../../styles/Base.css';
import '../../../styles/Prose.css';
import '../../../styles/RichText.css';

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

export function createTaskItemNodeView() {
  return ReactNodeViewRenderer(TaskItemView, { as: 'li' });
}
