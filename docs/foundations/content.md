---
aliases:
  - content design
  - writing
  - microcopy
  - UX writing
  - voice and tone
  - wording
  - sentence case
  - capitalisation
  - error messages
  - button labels
  - sample data
---

# Content guidelines

The words of an interface built with envUI: titles, labels, buttons, messages and sample data. Components and patterns link here for the rules they share.

## Voice

Write as a calm, direct colleague who knows the task: plain words, short sentences and the active voice.

- Speak to the reader as "you", and call them "people" in documentation; never "the user".
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

## Labels, descriptions and placeholders

- A label is a short noun phrase without a colon: "Project name".
- Mark the optional fields, "(optional)", not the required ones.
- A format or constraint goes in the description, read before people type.
- A placeholder only for an example value, "name@example.com", or "Choose a team" in an empty select; never the label or instructions.

| Do                                                          | Don't                                                    |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Label "Description (optional)"                              | Label "Description\*", with every required field starred |
| Label "Handle", description "Lowercase letters and numbers" | Placeholder "Enter a handle (lowercase only)"            |

## Error messages

- Start with the fix, in the field's own terms: "Enter a due date after the start date".
- No "Error:" prefix, no code on its own and no blame; a code may follow for support, "Reference 4F2A".
- A form's error summary is titled "There is a problem" and repeats each field's message.
- A failure of the system says what happened, whether work is safe and what to do.

| Do                                           | Don't                          |
| -------------------------------------------- | ------------------------------ |
| Enter an email address like name@example.com | Error: invalid input           |
| Enter a project name                         | Project name is required!      |
| Couldn't load projects. Try again.           | Error 503: Service Unavailable |

## Empty states

The title states the fact, the description says why or what next, and one action at most resolves it.

- **First use:** what the place is for, and the first action. "No projects yet" — "Projects bring files, tasks and people together." — "Create project".
- **No results:** name the query and offer to clear it. "No matching projects" — "No project names contain “roadmap”." — "Clear filters".
- **Done:** a factual title, without celebration. "No tasks left" — "New tasks assigned to you appear here."
- **Failed:** the danger tone and a way to try again. "Couldn't load projects" — "Your projects are safe. Check your connection and try again." — "Try again".

## Feedback and status

- A toast: what happened to what, in the past tense, "Website refresh archived.", or the state a setting leaves; one action at most.
- An Alert: the condition as its title, and one sentence on what to do.
- Name what is loading, "Loading projects", count in the units people think in, "12 of 40 MB", and promise no time.

## Confirmations

- A dialog's title asks the question with the object's name; the description says the consequence and whether it can be undone.
- The confirm button repeats the verb and object, "Delete project"; the other stays "Cancel". Never "Are you sure?".
- An inline confirmation's armed label is short and has no question mark: the verb, or the verb and object, "Remove file".

| Do                                         | Don't                          |
| ------------------------------------------ | ------------------------------ |
| Delete Website refresh? — "Delete project" | Are you sure? — "Yes" / "No"   |
| Armed in place: "Remove file"              | Armed in place: "Remove file?" |

## Numbers, dates and time

- Format with `Intl` in the locale `useLocale` returns from [EnvUIProvider](../setup.md#locale-strings-and-direction), so they match envUI's own.
- A recent moment with [RelativeTime](../components/relative-time.md), "3 hours ago"; a date further away, or one people plan by, as a date, "4 Mar 2026".
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

## Sample data

Examples, screenshots and tests use one neutral set of sample data, so they look like a real application without naming one.

- **People:** Alex Morgan, Sam Lee, Priya Shah, Jordan Kim, Maria Garcia and Chen Wei, with email addresses at `example.com`, such as `alex.morgan@example.com`.
- **Organisation and application:** Northwind.
- **Things:** projects, such as Website refresh, Quarterly report, Onboarding guide, Mobile release, Data migration and Annual review; documents; tasks; teams.
- **Dates:** absolute dates in February and March 2026, so relative times read naturally.
- **No product names and no logos.** envUI never names the products that use it, in code, documentation, comments or sample data. Describe a behaviour instead of naming where it comes from.

## Related topics

- [Accessibility](../foundations/accessibility.md)
- [Typography](../foundations/typography.md)
- [TextField](../components/text-field.md)
- [Empty states](../patterns/empty-states.md)
- [Toast](../components/toast.md)
- [ConfirmDialog](../components/confirm-dialog.md)
