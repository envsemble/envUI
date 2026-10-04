import { Toolbar } from '@base-ui/react/toolbar';
import { IconButton } from '../../actions/Button.js';
import { ButtonGroup } from '../../actions/ButtonGroup.js';
import { Title } from '../../icons/Title.js';
import { FormatBold } from '../../icons/FormatBold.js';
import { FormatItalic } from '../../icons/FormatItalic.js';
import { FormatListBulleted } from '../../icons/FormatListBulleted.js';
import { FormatListNumbered } from '../../icons/FormatListNumbered.js';
import { FormatQuote } from '../../icons/FormatQuote.js';
import { Code } from '../../icons/Code.js';
import { CodeBlocks } from '../../icons/CodeBlocks.js';
import { Link } from '../../icons/Link.js';
import { Undo } from '../../icons/Undo.js';
import { Redo } from '../../icons/Redo.js';
import type { MarkdownCommand } from './MarkdownFormatting.js';

const tools = [
  { command: 'heading', label: 'Heading', Icon: Title },
  { command: 'bold', label: 'Bold', Icon: FormatBold },
  { command: 'italic', label: 'Italic', Icon: FormatItalic },
  { command: 'bullet-list', label: 'Bulleted list', Icon: FormatListBulleted },
  { command: 'numbered-list', label: 'Numbered list', Icon: FormatListNumbered },
  { command: 'quote', label: 'Quote', Icon: FormatQuote },
  { command: 'inline-code', label: 'Inline code', Icon: Code },
  { command: 'code-block', label: 'Code block', Icon: CodeBlocks },
  { command: 'link', label: 'Insert link', Icon: Link },
] satisfies { command: MarkdownCommand; label: string; Icon: typeof Title }[];

export function MarkdownToolbar({
  commands,
  disabled,
  canUndo,
  canRedo,
  onCommand,
  onUndo,
  onRedo,
}: {
  commands: readonly MarkdownCommand[];
  disabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onCommand: (command: MarkdownCommand) => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="env-markdown-toolbar">
      <Toolbar.Root render={<ButtonGroup />} aria-label="Markdown formatting" disabled={disabled}>
        {tools
          .filter((tool) => commands.includes(tool.command))
          .map(({ command, label, Icon }) => (
            <Toolbar.Button
              key={command}
              focusableWhenDisabled={false}
              render={<IconButton icon={<Icon />} aria-label={label} title={label} />}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onCommand(command)}
            />
          ))}
        <Toolbar.Button
          disabled={!canUndo}
          focusableWhenDisabled={false}
          render={<IconButton icon={<Undo />} aria-label="Undo" title="Undo" />}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onUndo}
        />
        <Toolbar.Button
          disabled={!canRedo}
          focusableWhenDisabled={false}
          render={<IconButton icon={<Redo />} aria-label="Redo" title="Redo" />}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onRedo}
        />
      </Toolbar.Root>
    </div>
  );
}

export const defaultMarkdownCommands = tools.map((tool) => tool.command);
