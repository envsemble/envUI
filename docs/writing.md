---
aliases:
  - content guidelines
  - content design
  - writing
  - microcopy
  - UX writing
  - voice and tone
  - wording
  - sentence case
  - capitalisation
  - button labels
  - action words
---

# Writing

The words of an interface built with envUI: titles, labels, buttons and messages. This guide holds the rules every screen shares. The words of one kind of screen live with its pattern: labels and error messages with [forms](patterns/forms.md), empty states with [empty states](patterns/empty-states.md), toasts, alerts and statuses with [feedback](patterns/feedback.md), and confirmations with [destructive actions](patterns/destructive-actions.md). A component's own labels are on its page, such as [Button](components/button.md)'s.

## Voice

Write as a calm, direct colleague who knows the task: plain words, short sentences and the active voice.

- Speak to the reader as "you"; never "the user".
- Say what happened and what to do next, without blame, jargon or codes.
- No exclamation marks, "please", "simply", "just", "easy" or "oops".
- "We" only where a person or a service really acted: "We sent a code to sam.lee@example.com".

| Do                                     | Don't                                            |
| -------------------------------------- | ------------------------------------------------ |
| Project archived.                      | Success! Your project has been archived!         |
| You can restore it from Archived.      | Simply go to Archived if you want to restore it. |
| Your changes weren't saved. Try again. | Oops! We had a problem saving. Please try again. |
| Sam Lee can now edit Website refresh.  | The user has been granted edit permissions.      |

## Capitalisation and punctuation

- Sentence case everywhere: only the first word and proper names take a capital.
- No full stop on a label, button, title, tab or menu item; a sentence takes one.
- An ellipsis (…) only on an action that asks for more before it acts: "Rename…".
- Curly quotes and apostrophes, “Website refresh”, can’t; an en dash for a range, 1–5 March.

| Do                    | Don't                  |
| --------------------- | ---------------------- |
| Create project        | Create New Project     |
| Notification settings | Notification Settings: |
| Rename…               | Rename...              |

## Lists

A list is for a few short, parallel items, usually not full sentences, such as the things a plan includes. Use one sparingly: a column of sentences reads as a wall of text, so write a point that needs a sentence as a sentence, and a few rules as a short paragraph. More than five or six items, or items with several facts each, are a table.

## Buttons and actions

- A verb and its object, "Export report"; a verb alone only where the object is plain, such as "Save" at the end of a form.
- One verb through a flow: "Delete project…", "Delete Website refresh?", "Delete project".
- The count in a label that acts on several things: "Archive 4 projects".
- A link named after its destination, never "Click here" or "Learn more" alone.

Words people confuse, by what they mean:

| Word      | Means                                                                     | Not                                    |
| --------- | ------------------------------------------------------------------------- | -------------------------------------- |
| Create    | Make something new: "Create project".                                     | Add, for something new                 |
| Add       | Put something that exists into something else: "Add Sam Lee to the team". | Create                                 |
| Delete    | Remove for good: the thing is gone.                                       | Remove, when the thing is gone         |
| Remove    | Take out of a place; the thing remains: "Remove from team".               | Delete, when the thing remains         |
| Save      | Keep changes made in a form or a document.                                | Submit, OK                             |
| Apply     | Use settings or filters and stay where you are.                           | Save, for filters                      |
| Done      | Finish a task or close a panel after changes that are already kept.       | OK                                     |
| Cancel    | Abandon what is in progress, changes included.                            | Close, when changes would be lost      |
| Close     | Dismiss something with nothing pending.                                   | Cancel, when nothing is lost           |
| Edit      | Change the content of something.                                          | Modify, Update                         |
| Rename    | Change only the name.                                                     | Edit, for a name alone                 |
| Duplicate | Make a copy beside the original.                                          | Clone, Copy (Copy puts on a clipboard) |
| Archive   | Put out of the way, restorable.                                           | Delete, Hide                           |
| Restore   | Bring back something archived or deleted.                                 | Undelete, Recover                      |
| Sign in   | Start a session; the noun and the verb are the same. "Sign out" ends it.  | Log in, Login, Log out                 |
| Continue  | Go on to the next step of a flow; "Back" returns.                         | Next, Proceed                          |
| Try again | Repeat something that failed.                                             | Retry, Reload                          |
| Undo      | Reverse what just happened.                                               | Revert, Cancel                         |
| Export    | Turn data into a file in another format.                                  | Download, for a conversion             |
| Download  | Copy a file that exists to the device.                                    | Export, for a file that exists         |
| Invite    | Ask someone to join.                                                      | Add, for someone not yet a member      |
| Share     | Give others access or a link.                                             | Send, Publish                          |

## Numbers, dates and time

- Format with `Intl` in the locale `useLocale` returns from [EnvUIProvider](setup.md#locale-strings-and-direction), so they match envUI's own.
- A recent moment with [RelativeTime](components/relative-time.md), "3 hours ago"; a date further away, or one people plan by, as a date, "4 Mar 2026".
- Plurals from the count with a function or `Intl.PluralRules`, never by adding "s".
- Digits, the locale's separators, and a non-breaking space between a number and its unit: "12 MB".

## Inclusive and accessible wording

- Name the control, not where it is or how to press it: "Select Export", not "Click the button on the right".
- Gender-neutral words, and no idioms, which don't translate.
- Alternative text by an image's purpose; none for decoration.
- Link and button text unique on a page: "Edit Website refresh".

## Ready for translation

- Whole sentences with their values in them, "Archived {name}.", never built from pieces.
- Room for text to grow by about 30%; no text in images or icons.
- envUI's own strings through EnvUIProvider's `messages`, in the application's language.

## Related topics

- [Accessibility](foundations/accessibility.md)
- [Typography](foundations/typography.md)
- [Form layout and validation](patterns/forms.md)
- [Empty states](patterns/empty-states.md)
- [Notifications and feedback](patterns/feedback.md)
- [Destructive actions](patterns/destructive-actions.md)
