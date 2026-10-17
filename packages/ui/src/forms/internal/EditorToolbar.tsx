'use client';

import type { MouseEvent, ReactNode } from 'react';
import { ButtonGroup } from '../../actions/ButtonGroup.js';
import * as Toolbar from '../../actions/Toolbar.js';
import { editor as editorMessages } from '../../foundations/messages/editor.js';
import { Redo } from '../../icons/Redo.js';
import { Undo } from '../../icons/Undo.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { editorCommands, type EditorCommand } from './EditorCommands.js';

/** A press on a toolbar button keeps focus, and the selection, in the editor. */
const keepFocus = (event: MouseEvent) => event.preventDefault();

/**
 * The formatting toolbar MarkdownEditor and RichTextEditor share: a Toolbar of connected buttons,
 * the commands the editor offers, then Undo and Redo and any of the editor's own buttons, which it
 * passes as Toolbar.Buttons. It scrolls sideways where it is wider than the editor.
 */
export function EditorToolbar<Command extends EditorCommand>({
  label,
  commands,
  active,
  disabled,
  canUndo,
  canRedo,
  onCommand,
  onUndo,
  onRedo,
  children,
}: {
  /** Names the toolbar, such as Markdown formatting. */
  label: string;
  commands: readonly Command[];
  /** The commands on at the selection, drawn pressed; undefined where the editor can't tell. */
  active?: readonly Command[];
  disabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onCommand: (command: Command) => void;
  onUndo: () => void;
  onRedo: () => void;
  /** The editor's own buttons after Undo and Redo, such as Attach files. */
  children?: ReactNode;
}) {
  const messages = useMessages('editor', editorMessages);
  return (
    <div className="env-editor-toolbar">
      <Toolbar.Root aria-label={label} disabled={disabled} render={<ButtonGroup />}>
        {commands.map((command) => {
          const { icon: Icon, message } = editorCommands[command];
          return (
            <Toolbar.Button
              key={command}
              variant="secondary"
              icon={<Icon />}
              label={messages[message]}
              pressed={active?.includes(command)}
              onMouseDown={keepFocus}
              onClick={() => onCommand(command)}
            />
          );
        })}
        <Toolbar.Button
          variant="secondary"
          icon={<Undo />}
          label={messages.undo}
          disabled={!canUndo}
          onMouseDown={keepFocus}
          onClick={onUndo}
        />
        <Toolbar.Button
          variant="secondary"
          icon={<Redo />}
          label={messages.redo}
          disabled={!canRedo}
          onMouseDown={keepFocus}
          onClick={onRedo}
        />
        {children}
      </Toolbar.Root>
    </div>
  );
}

export { keepFocus as keepEditorFocus };
