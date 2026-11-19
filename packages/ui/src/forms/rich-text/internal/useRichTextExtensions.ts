'use client';

import { useMemo, type RefObject } from 'react';
import { Extension } from '@tiptap/core';
import type { PluginKey } from '@tiptap/pm/state';
import { Suggestion } from '@tiptap/suggestion';
import { editor as editorMessages } from '../../../foundations/messages/editor.js';
import { richText as richTextMessages } from '../../../foundations/messages/richText.js';
import { editorCommands } from '../../../internal/editor/editorCommands.js';
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import { createRichTextExtensions } from '../extensions.js';
import type { RichTextEditorProps, RichTextSlashCommand } from '../types.js';
import { runRichTextCommand, slashCommandIds } from './commands.js';
import { createSuggestionOptions, referenceSuggestion } from './suggestions.js';

export interface RichTextExtensionsLatest extends Pick<
  RichTextEditorProps,
  'renderReference' | 'onReferenceClick'
> {
  disabled: boolean;
  readOnly: boolean;
  commandMessages: typeof editorMessages;
}

export function useRichTextExtensions(
  {
    extensions,
    placeholder,
    references,
    slashCommands,
  }: Required<Pick<RichTextEditorProps, 'extensions' | 'references' | 'slashCommands'>> &
    Pick<RichTextEditorProps, 'placeholder'>,
  latest: RefObject<RichTextExtensionsLatest>,
) {
  const messages = useMessages('richText', richTextMessages);
  const slashListLabelReadOncePerSession = messages.commands;
  return useMemo(() => {
    if (new Set(references.map((source) => source.trigger)).size !== references.length)
      throw new Error('Reference triggers must be unique.');
    if (slashCommands && references.some((source) => source.trigger === '/'))
      throw new Error('Use either a / reference source or slashCommands.');
    const editable = () => !latest.current.disabled && !latest.current.readOnly;
    const suggestions = references.map((source) => ({
      ...referenceSuggestion(source),
      shouldShow: editable,
    }));
    const suggestionKeys: PluginKey[] = suggestions.flatMap((suggestion) =>
      suggestion.pluginKey ? [suggestion.pluginKey] : [],
    );
    const result = createRichTextExtensions({
      extensions,
      placeholder,
      renderReference: (reference, context) =>
        latest.current.renderReference?.(reference, context) ??
        `${reference.trigger ?? ''}${reference.label}`,
      onReferenceClick: (reference, event) => latest.current.onReferenceClick?.(reference, event),
    }).map((extension) =>
      extension.name === 'envReference' ? extension.configure({ suggestions }) : extension,
    );
    if (slashCommands) {
      const builtInBlockCommandsThenApplicationsOwn = (): RichTextSlashCommand[] => [
        ...slashCommandIds.map((command) => ({
          id: command,
          label: latest.current.commandMessages[editorCommands[command].message],
          run: (editor: Parameters<RichTextSlashCommand['run']>[0]) => {
            runRichTextCommand(editor, command);
          },
        })),
        ...(Array.isArray(slashCommands) ? slashCommands : []),
      ];
      const options = createSuggestionOptions<RichTextSlashCommand>({
        char: '/',
        label: slashListLabelReadOncePerSession,
        rowContent: ({ start, description }) => ({ start, description }),
        items: ({ query }) =>
          builtInBlockCommandsThenApplicationsOwn().filter((command) =>
            command.label.toLowerCase().includes(query.toLowerCase()),
          ),
      });
      if (options.pluginKey) suggestionKeys.push(options.pluginKey);
      result.push(
        Extension.create({
          name: 'envSlashCommands',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                ...options,
                editor: this.editor,
                shouldShow: editable,
                command: ({ editor, range, props: command }) => {
                  editor.chain().focus().deleteRange(range).run();
                  command.run(editor);
                },
              }),
            ];
          },
        }),
      );
    }
    return { extensions: result, suggestionKeys };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensions, placeholder, references, slashCommands]);
}
