'use client';

import { Children, Fragment, type MouseEvent, type ReactNode } from 'react';
import * as Toolbar from '../../actions/Toolbar.js';
import { editor as editorMessages } from '../../foundations/messages/editor.js';
import { Redo } from '../../icons/Redo.js';
import { Undo } from '../../icons/Undo.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { editorCommandGroup, editorCommands, type EditorCommand } from './editorCommands.js';

/** A press on a toolbar button keeps focus, and the selection, in the editor. */
const keepFocus = (event: MouseEvent) => event.preventDefault();

/**
 * The commands in runs of one kind, in the order given: each run is a group of the toolbar, such as
 * the text styles or the lists.
 */
function groupsOf<Command extends EditorCommand>(commands: readonly Command[]) {
  const groups: Command[][] = [];
  for (const command of commands) {
    const last = groups.at(-1);
    if (last && editorCommandGroup[last[0]!] === editorCommandGroup[command]) last.push(command);
    else groups.push([command]);
  }
  return groups;
}

/**
 * The formatting toolbar MarkdownEditor and RichTextEditor share: a Toolbar whose groups, with a
 * separator between each, hold the commands the editor offers, run by run of one kind (text styles,
 * lists, blocks, and links and tables), then Undo and Redo, then any of the editor's own buttons,
 * which it passes as Toolbar.Buttons. A command the editor can tell is on at the selection, such as
 * Bold, is a toggle button. The toolbar is one tab stop, the arrow keys move between its buttons,
 * and it scrolls sideways where it is wider than the editor.
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
  const own = Children.toArray(children);
  const groups: { key: string; buttons: ReactNode }[] = groupsOf(commands).map((group) => ({
    key: group.join(' '),
    buttons: group.map((command) => {
      const { icon: Icon, message } = editorCommands[command];
      return (
        <Toolbar.Button
          key={command}
          icon={<Icon />}
          label={messages[message]}
          pressed={active?.includes(command)}
          onMouseDown={keepFocus}
          onClick={() => onCommand(command)}
        />
      );
    }),
  }));
  groups.push({
    key: 'history',
    buttons: (
      <>
        <Toolbar.Button
          icon={<Undo />}
          label={messages.undo}
          disabled={!canUndo}
          onMouseDown={keepFocus}
          onClick={onUndo}
        />
        <Toolbar.Button
          icon={<Redo />}
          label={messages.redo}
          disabled={!canRedo}
          onMouseDown={keepFocus}
          onClick={onRedo}
        />
      </>
    ),
  });
  if (own.length > 0) groups.push({ key: 'own', buttons: own });
  return (
    <div className="env-editor-toolbar">
      <Toolbar.Root aria-label={label} disabled={disabled}>
        {groups.map(({ key, buttons }, index) => (
          <Fragment key={key}>
            {index > 0 && <Toolbar.Separator />}
            <Toolbar.Group>{buttons}</Toolbar.Group>
          </Fragment>
        ))}
      </Toolbar.Root>
    </div>
  );
}

export { keepFocus as keepEditorFocus };
