# Comboboxes

## React usage

```tsx
import { Avatar, Combobox } from '@envsemble/envui';

const people = members.map((member) => ({
  value: member.id,
  label: member.name,
  description: member.email,
  leading: <Avatar name={member.name} src={member.pictureUrl} />,
}));

<Combobox
  label="Owner"
  name="owner"
  items={people}
  value={owner}
  onValueChange={setOwner}
  clearable
/>

<Combobox
  multiple
  label="Reviewers"
  name="reviewers"
  items={people}
  value={reviewers}
  onValueChange={setReviewers}
  placeholder="Add people"
/>

<Combobox
  density="compact"
  aria-label="Document"
  placeholder="Document"
  items={[
    { label: 'Recent', items: [{ value: 'quarterly-report', label: 'Quarterly report' }] },
    { label: 'Folders', items: [{ value: 'design-system/tokens', label: 'design-system/tokens' }] },
  ]}
/>;
```

### Props & contracts

| Name                              | Contract                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| items                             | Options `{ value, label, description?, leading?, disabled? }` in display order, or groups `{ label, items }`        |
| description                       | A muted second line, such as an e-mail address; announced as the option's description                               |
| leading                           | Content before the label, such as an Avatar or an icon; it takes the size of its slot in the list, chips and field  |
| multiple                          | Several options can be chosen; they show as removable chips in the field                                            |
| value / defaultValue              | The chosen value or null; with multiple, the chosen values in the order they were chosen                            |
| onValueChange                     | Receives the value or values, and the chosen option or options, one for each value (see below)                      |
| filter                            | By default, options whose label or description contains the typed text, ignoring case and accents; or a function    |
| filter={null}                     | Shows items as given, for options the application finds itself, such as on a server                                 |
| onInputValueChange                | Receives the typed text, and an empty string once the query ends: the text is cleared, or the label shows again     |
| loading / loadingLabel            | The options are loading: the popup shows a spinner and announces loadingLabel (Loading…), not emptyLabel            |
| emptyLabel                        | Shown when no option matches; No matches by default                                                                 |
| label / hint / error              | Floating label, guidance and validation like Input; hint and error are linked to the field                          |
| density                           | standard (default), the text field of forms, or compact: 2 rem like a compact Select, with the compact menu's popup |
| showLabel                         | Show the label inside the field; true unless the field is compact, which can use a placeholder instead              |
| clearable / clearLabel            | A clear button (named Clear) removes the value while there is one; so does <kbd>Esc</kbd> on a closed single field  |
| removeLabel                       | Accessible name of a chip's remove button from its option's label; Remove and the label by default                  |
| open / defaultOpen / onOpenChange | Optional control of the popup; onOpenChange also suits loading the options as it opens                              |
| locale                            | The locale the default filter compares text in; the browser's by default                                            |
| Native participation              | name, form, required, disabled and readOnly; a multiple field submits one entry per chosen value                    |
| Native input props                | placeholder, autoFocus, aria-label, ref and other attributes of the text input                                      |

### Search on a server

```tsx
import { Combobox } from '@envsemble/envui';

<Combobox
  label="Contact"
  items={results}
  filter={null}
  loading={searching}
  onInputValueChange={setQuery}
  emptyLabel={query ? 'No contacts found' : 'Type a name to search'}
  value={contact}
  onValueChange={(value, item) => {
    setContact(value);
    setContactItem(item);
  }}
/>;
```

With `filter={null}` the list shows `items` as given while the application searches for the typed text. Once the query ends, as the field shows its chosen label again after a choice or when people leave the query, onInputValueChange receives an empty string, so results for an abandoned query never stay in the list for <kbd>Enter</kbd> to choose. Include the chosen options in `items` when the field first shows them, such as when editing a saved value; options chosen from earlier results keep their labels and chips. A value the field never saw among `items` shows as itself, and onValueChange reports it as `{ value, label: value }`, so the options always line up with the values.

## Guidelines

- Use a combobox to choose from a list long enough to search, such as people, contacts or documents, one option or several. Use Select for a handful of options, and SearchField to search content.
- Typing filters the options and highlights the first match, also when matches arrive from a server, so <kbd>Enter</kbd> chooses it. <kbd>↑</kbd> and <kbd>↓</kbd> move the highlight and open the popup, a press or <kbd>Enter</kbd> chooses, and <kbd>Esc</kbd> closes the popup. Focus stays in the field throughout, following the WAI-ARIA combobox pattern.
- A single combobox shows the chosen option's label as its text, with the option's leading content before it. Focusing the field selects the label, so typing replaces it with a query. Without clearable, the value can change but not be removed, like a Select: emptying the text and leaving the field brings the label back. With clearable, the clear button, <kbd>Esc</kbd> on the closed field and emptying the text remove it. When there is nothing to clear, <kbd>Esc</kbd> changes nothing and goes on to close an enclosing dialog.
- Chosen options of a multiple combobox are chips at the start of the field, which wraps them onto more rows. Choosing an option again removes it. <kbd>Backspace</kbd> in the empty text removes the last chip; <kbd>←</kbd> at the start of the text reaches the chips, <kbd>←</kbd> and <kbd>→</kbd> move between them, and <kbd>Backspace</kbd> or <kbd>Delete</kbd> removes the focused chip. With clearable, the clear button removes them all. <kbd>Esc</kbd> never removes chips: with the popup closed it goes on to close an enclosing dialog. Each chip's remove button is named after its option, such as Remove Alex Morgan. The field's description lists the chosen options.
- The field is the shared text field: the same label, hint and error, invalid border, disabled and read-only states as Input. Compact fields take the compact control height, 2 rem, and line up with compact Selects and Buttons. On touch screens fields, chips and options grow to the touch height.
- The popup is Select's raised popup, at least as wide as the field. Options are rounded rows inset by its padding that highlight on hover and with the keyboard, with a check mark slot, leading content and labels that line up across rows, and a muted description below the label. Groups have small headings. The list scrolls beyond 20 rem, flips above the field near the edge of the window, and keeps the originating theme in its portal, also inside a Dialog.
- Read-only fields can be focused and browsed but not changed; disabled fields cannot be focused and leave their value out of form submission.
- Native forms submit the value under name, one entry per chosen value with multiple, and a form reset restores an uncontrolled field's defaultValue. required asks for a value, or at least one chip. Validation stays with the application.

TypeScript declarations provide the complete public API.

## Related topics

- [Selects](../components/select.md)
- [Text fields](../components/fields.md)
- [Avatars](../components/avatar.md)
- [Menus](../components/menu.md)
- [Accessibility](../foundations/accessibility.md)
