# Menubar

## React usage

```tsx
import { Menu, Menubar } from '@envsemble/envui';

<Menubar.Root aria-label="Application menu" accessKeys>
  <Menubar.Menu label="File" accessKey="F">
    <Menu.Item shortcut="Ctrl+N" onClick={createNote}>
      New note
    </Menu.Item>
    <Menu.Submenu label="Open recent">
      {recentNotes.map((note) => (
        <Menu.Item key={note.id} onClick={() => openNote(note.id)}>
          {note.title}
        </Menu.Item>
      ))}
    </Menu.Submenu>
    <Menu.Separator />
    <Menu.Item shortcut="Ctrl+W" onClick={closeWindow}>
      Close window
    </Menu.Item>
  </Menubar.Menu>
  <Menubar.Menu
    label="Edit"
    accessKey="E"
    onOpenChange={(open, { previousFocus }) => {
      if (open) editTarget.current = previousFocus;
    }}
  >
    <Menu.Item shortcut="Ctrl+C" onClick={() => copyFrom(editTarget.current)}>
      Copy
    </Menu.Item>
    <Menu.Item shortcut="Ctrl+V" onClick={() => pasteInto(editTarget.current)}>
      Paste
    </Menu.Item>
  </Menubar.Menu>
  <Menubar.Menu label="View" accessKey="V">
    <Menu.CheckboxItem checked={wordWrap} onCheckedChange={setWordWrap}>
      Word wrap
    </Menu.CheckboxItem>
  </Menubar.Menu>
  <Menubar.Menu label="Help" accessKey="H">
    <Menu.Item onClick={openShortcuts}>Keyboard shortcuts</Menu.Item>
  </Menubar.Menu>
</Menubar.Root>;
```

### Props & contracts

| Name                                           | Contract                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Menubar.Root aria-label                        | Required accessible name, such as Application menu                                                           |
| Menubar.Root accessKeys                        | Desktop access keys, off by default; see the guidelines                                                      |
| Menubar.Root disabled                          | Disables every menu                                                                                          |
| Menubar.Root native props                      | className, id, style, ref and other div attributes                                                           |
| Menubar.Menu label                             | The trigger's text, such as File                                                                             |
| Menubar.Menu accessKey                         | A letter of the label that opens the menu with <kbd>Alt</kbd> when accessKeys is on, such as F for File      |
| Menubar.Menu children                          | The menu's parts: Menu.Item, Menu.Submenu, Menu.Group, Menu.RadioGroup, Menu.CheckboxItem and Menu.Separator |
| Menubar.Menu density                           | compact by default; standard for the larger rows of other menus                                              |
| Menubar.Menu disabled                          | The trigger stays in place but cannot open its menu                                                          |
| Menubar.Menu open / defaultOpen / onOpenChange | Optional control; onOpenChange(open, { previousFocus }) also reports the element focused before the menubar  |
| Menubar.Menu aria-label / className            | Name of the menu, the label by default when it is text, and the class of its popup                           |

## Guidelines

- A menubar holds an application's commands in a desktop-style window, typically in its title bar: see AppShell's titleBar and TitleBar on the application shell page. Prefer it for document-centred applications with many commands; a single Menu suits a few.
- Triggers are compact text buttons in a row. Each menu opens below its trigger, aligned to its start, in compact density. Once a menu is open, moving the pointer over another trigger opens that menu instead; <kbd>←</kbd> and <kbd>→</kbd> do the same from the keyboard, and <kbd>↓</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> open a menu from its trigger. <kbd>Esc</kbd> closes it and leaves focus on its trigger.
- Opening a menu neither locks scrolling nor shifts the page, so the window stays as it was behind the menu.
- When a menu closes after a command, or after a click on its trigger or elsewhere, focus returns to where it was before the menubar took it, such as the document field, as in a desktop application. Focus that has moved on, for example into a dialog a command opened, stays there. With nothing to return to, a click elsewhere lets focus go, so <kbd>Space</kbd> or a letter does not open a menu again. onOpenChange reports that earlier element as previousFocus: keep it when the menu opens, and let commands such as Copy, Paste or Select all act on it.
- Shortcuts show as Kbd keys at the end of each row. They describe keys the application already handles, also while the menus are closed.
- With accessKeys, holding <kbd>Alt</kbd> underlines each menu's access key until another key is pressed or the window loses focus, and <kbd>Alt</kbd> with that letter opens the menu with focus on its first item. Pressing and releasing <kbd>Alt</kbd> alone moves focus to the first trigger, and <kbd>Alt</kbd> again or <kbd>Esc</kbd> returns it to where it was; while a trigger has focus, a menu's letter alone opens it. <kbd>Alt</kbd> with <kbd>Ctrl</kbd>, <kbd>Shift</kbd> or the meta key, and letters that no menu claims, stay with the page.
- Choose access keys that are letters of their labels and unique in the menubar, such as F, E, V and H. Turn accessKeys on for one menubar per window, and leave it off on systems whose menus have no access keys and where <kbd>Alt</kbd> types characters.

TypeScript declarations provide the complete public API.

## Related topics

- [Menus](../components/menu.md)
- [Application shell](../components/app-shell.md)
- [Keyboard keys](../components/keyboard.md)
- [Accessibility](../foundations/accessibility.md)
