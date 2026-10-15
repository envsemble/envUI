import { defaultUrlTransform } from 'react-markdown';

export type MarkdownCommand =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'bullet-list'
  | 'numbered-list'
  | 'quote'
  | 'inline-code'
  | 'code-block'
  | 'link';
export interface MarkdownSelection {
  value: string;
  start: number;
  end: number;
  direction: 'forward' | 'backward' | 'none';
}
export interface MarkdownLink {
  label: string;
  href: string;
}

export function readMarkdownSelection(input: HTMLTextAreaElement): MarkdownSelection {
  return {
    value: input.value,
    start: input.selectionStart,
    end: input.selectionEnd,
    direction: input.selectionDirection,
  };
}

export function formatMarkdown(
  selection: MarkdownSelection,
  command: Exclude<MarkdownCommand, 'link'>,
): MarkdownSelection {
  if (
    command === 'heading' ||
    command === 'quote' ||
    command === 'bullet-list' ||
    command === 'numbered-list'
  ) {
    return formatLines(selection, command);
  }
  const selected = selection.value.slice(selection.start, selection.end);
  const text =
    selected || (command === 'code-block' || command === 'inline-code' ? 'code' : 'text');
  if (command === 'code-block') {
    const fence = '`'.repeat(Math.max(3, longestBacktickRun(text) + 1));
    const before = selection.value.slice(0, selection.start);
    const after = selection.value.slice(selection.end);
    const prefix = `${before && !before.endsWith('\n') ? '\n\n' : ''}${fence}\n`;
    const suffix = `\n${fence}${after && !after.startsWith('\n') ? '\n\n' : ''}`;
    return replaceSelection(selection, prefix + text + suffix, prefix.length, text.length);
  }
  const delimiter =
    command === 'bold'
      ? '**'
      : command === 'italic'
        ? '*'
        : '`'.repeat(longestBacktickRun(text) + 1);
  const before = selection.value.slice(0, selection.start);
  const after = selection.value.slice(selection.end);
  if (selected && before.endsWith(delimiter) && after.startsWith(delimiter)) {
    return replaceSelection(
      {
        ...selection,
        start: selection.start - delimiter.length,
        end: selection.end + delimiter.length,
      },
      text,
      0,
      text.length,
    );
  }
  const padding =
    command === 'inline-code' && (/^`|`$/.test(text) || /^ .* $/.test(text)) ? ' ' : '';
  const prefix = delimiter + padding;
  return replaceSelection(
    selection,
    prefix + text + padding + delimiter,
    prefix.length,
    text.length,
  );
}

/** URL validation and Markdown escaping are identical for manual and application pickers. */
export function insertMarkdownLink(
  selection: MarkdownSelection,
  link: MarkdownLink,
): MarkdownSelection {
  const href = link.href.trim();
  // Control characters are what the pattern looks for: a link may not contain them.
  // eslint-disable-next-line no-control-regex
  if (!href || !defaultUrlTransform(href) || /[\u0000-\u001f\u007f]/u.test(href)) {
    throw new Error('Enter a valid URL or relative path.');
  }
  const label = (link.label.trim() || href).replace(/\r?\n/g, ' ').replace(/[\\`*_[\]<>]/g, '\\$&');
  const destination = href.replace(/[\s<>\\()]/g, (character) => encodeURIComponent(character));
  const text = `[${label}](${destination})`;
  return replaceSelection(selection, text, text.length, 0);
}

function replaceSelection(
  selection: MarkdownSelection,
  text: string,
  selectedStart: number,
  selectedLength: number,
): MarkdownSelection {
  return {
    value: selection.value.slice(0, selection.start) + text + selection.value.slice(selection.end),
    start: selection.start + selectedStart,
    end: selection.start + selectedStart + selectedLength,
    direction: 'none',
  };
}
function longestBacktickRun(text: string) {
  return (text.match(/`+/g) ?? []).reduce((longest, run) => Math.max(longest, run.length), 0);
}
function formatLines(
  selection: MarkdownSelection,
  command: 'heading' | 'quote' | 'bullet-list' | 'numbered-list',
): MarkdownSelection {
  const start =
    selection.start === 0 ? 0 : selection.value.lastIndexOf('\n', selection.start - 1) + 1;
  const lastCharacter =
    selection.end > selection.start && selection.value[selection.end - 1] === '\n'
      ? selection.end - 1
      : selection.end;
  const nextNewline = selection.value.indexOf('\n', lastCharacter);
  const end = nextNewline === -1 ? selection.value.length : nextNewline;
  const lines = selection.value.slice(start, end).split('\n');
  const pattern =
    command === 'heading'
      ? /^(\s*)#{1,6}\s+/
      : command === 'quote'
        ? /^(\s*)>\s?/
        : command === 'bullet-list'
          ? /^(\s*)[-+*]\s+/
          : /^(\s*)\d+[.)]\s+/;
  const remove = lines.every((line) => pattern.test(line));
  const text = lines
    .map((line, index) => {
      const plain = line.replace(pattern, '$1');
      if (remove) return plain;
      const prefix =
        command === 'heading'
          ? '## '
          : command === 'quote'
            ? '> '
            : command === 'bullet-list'
              ? '- '
              : `${index + 1}. `;
      return plain.replace(/^(\s*)/, `$1${prefix}`);
    })
    .join('\n');
  return replaceSelection({ ...selection, start, end }, text, 0, text.length);
}
