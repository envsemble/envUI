import type { ReactNode } from 'react';
import { Text } from '../../foundations/Text.js';
import '../../styles/Base.css';
import '../../styles/Editor.css';

/**
 * An editor's status line under its field, such as a link that could not be inserted: a polite
 * status in caption text, out of sight while it is empty.
 */
export function EditorStatus({ children }: { children?: ReactNode }) {
  return (
    <Text variant="caption" role="status" className="env-editor-status">
      {children}
    </Text>
  );
}
