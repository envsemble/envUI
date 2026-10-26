import { RichTextEditor, type RichTextSlashCommand } from '@envsemble/envui/rich-text';

// The application's own commands follow the built-in blocks in the menu.
const commands: RichTextSlashCommand[] = [
  {
    id: 'agenda',
    label: 'Meeting agenda',
    run: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent('<h2>Agenda</h2><ul><li><p>Updates</p></li><li><p>Decisions</p></li></ul>')
        .run(),
  },
];

export default function SlashCommands() {
  return (
    <RichTextEditor
      label="Weekly notes"
      placeholder="Type / for headings, lists, tables and the agenda"
      slashCommands={commands}
    />
  );
}
