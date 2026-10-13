# Composer

## React usage

```tsx
import { Composer, IconButton } from '@envsemble/envui';
import { AttachFile } from '@envsemble/envui/icons/AttachFile';

<Composer
  aria-label="Message"
  placeholder="Ask anything"
  value={draft}
  onValueChange={setDraft}
  onSubmit={(text) => {
    send(text);
    setDraft('');
  }}
  running={replying}
  onStop={stopReply}
  start={<IconButton variant="text" icon={<AttachFile />} aria-label="Attach files" />}
  footer="Files up to 10 MB"
/>;
```

### Props & contracts

| Name                                 | Contract                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| aria-label / aria-labelledby         | Required name of the field, which has no visible label                                                                                           |
| value / defaultValue / onValueChange | Controlled or uncontrolled text; an uncontrolled composer clears after each submit through onSubmit and reports an empty string                  |
| onSubmit                             | Receives the text as typed, from <kbd>Enter</kbd> or the send button; blank text, a running or a disabled composer never submits                 |
| name / form                          | Without onSubmit, <kbd>Enter</kbd> and the send button submit the field's form, which sends the text under name; not while its action is pending |
| running / onStop                     | The send button becomes a stop button that calls onStop; <kbd>Enter</kbd> does not submit while running                                          |
| sendLabel / stopLabel                | Accessible names of the button; Send and Stop by default                                                                                         |
| minRows / maxRows                    | Lines while empty, 1 by default, and before the field scrolls, 8 by default                                                                      |
| start                                | Content at the start of the action row, such as an attach button or the name of a model                                                          |
| footer                               | Short supporting text below the composer; it describes the field                                                                                 |
| disabled                             | Disables the field and sending; the stop button stays available while running                                                                    |
| Native textarea props                | placeholder, maxLength, name, autoFocus, ref and other attributes reach the field; className and style apply to the composer                     |

## Guidelines

- Use Composer for the message field of a chat or a comment thread, below its MessageList. Use Textarea for multiline values in forms.
- <kbd>Enter</kbd> submits and <kbd>Shift</kbd>+<kbd>Enter</kbd> starts a new line. <kbd>Enter</kbd> that confirms an input method's composition never submits, and touch keyboards label their <kbd>Enter</kbd> key Send.
- Handle the text with onSubmit, which clears an uncontrolled composer, or give the field a name inside a form and leave onSubmit out: <kbd>Enter</kbd> and the send button then submit the form, and the text stays until the form resets, as it does after a form action succeeds. Without either there is nothing to send: the send button is unavailable and <kbd>Enter</kbd> starts a new line.
- A held <kbd>Enter</kbd> key sends once. While the form's action is pending, sending is unavailable: a composer inside the form learns it from the form's status. For a form submitted another way, such as with a request in its submit handler, set disabled from that request's pending state. When another field of the form is invalid, the browser reports it, nothing is sent and focus moves to that field.
- The field grows with its text from minRows to maxRows, then scrolls. A single line sits centered beside the round send button; with start content, the button moves to an action row below the field. Start content lines up with the field's text above it; a leading icon button lines up its icon, its round target reaching into the inset.
- The send button is unavailable while the text is blank. It stays focusable, so focus stays on it as it turns into the stop button and back. After a send from the button, focus returns to the field.
- While running, people can write their next message; it waits until the reply has ended. Disable the field during a run only when the conversation cannot take another message.
- The composer is a raised surface in the popup colors with a hairline border, at home on the canvas and on panes. Focus in the field recolors and thickens the outline; a press on the surface around the field places the caret in it. Coarse pointers get the touch-sized button and larger text.
- Keep footer text short, such as a note on attachments. Name the start content's controls like any other icon action. A message that could not be sent shows its status in the conversation.

TypeScript declarations provide the complete public API.

## Related topics

- [Messages](../components/messages.md)
- [Text fields](../components/fields.md)
- [Buttons](../components/buttons.md)
- [Accessibility](../foundations/accessibility.md)
