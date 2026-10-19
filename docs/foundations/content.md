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

These rules cover the words in an interface built with envUI: titles, labels, buttons, messages and the sample data in examples. Components and patterns link here for the rules they share, and keep only their own rules on their pages. The preview shows each rule as a pair, a version to follow and one to avoid.

## Voice

Write as a calm, direct colleague who knows the task: plain words, short sentences and the active voice.

- Speak to the reader as "you", and call them "people" in documentation. Never write "the user" in the interface.
- Say what happened and what to do next, without blame, starting with the fix where there is one: "Enter a password with at least 12 characters", not "You entered an invalid password".
- Leave out jargon, codes and internal names: "Couldn't reach the server", not "ECONNRESET".
- Leave out exclamation marks, "please", "simply", "just", "easy" and "oops". An interface that is calm and clear needs no apology and no cheer.
- Let the interface stay out of the sentence. "We" belongs only where a person or a service really acted: "We sent a code to sam.lee@example.com" names the sender, but "Your changes weren't saved" needs no "we".

| Do                                     | Don't                                            |
| -------------------------------------- | ------------------------------------------------ |
| Project archived.                      | Success! Your project has been archived!         |
| You can restore it from Archived.      | Simply go to Archived if you want to restore it. |
| Your changes weren't saved. Try again. | Oops! We had a problem saving. Please try again. |
| Sam Lee can now edit Website refresh.  | The user has been granted edit permissions.      |

## Capitalisation and punctuation

- Use sentence case everywhere: page and section titles, labels, buttons, menu items, tabs, column headers and toasts. Only the first word and proper names take a capital: "Create project", "Invite people to Northwind".
- End no label, button, title, tab or menu item with a full stop. End a description, a message or any other text that is a sentence with one; a description that is only a format or a constraint, such as "Lowercase letters, numbers and hyphens", takes none.
- Use an ellipsis (…, one character) only on an action that asks for more before it acts, such as "Rename…" or "Delete project…" in a menu. An action that acts at once has none.
- Use curly quotes and apostrophes in interface text: “Website refresh”, can’t. Use an en dash for a range: 1–5 March, 10:00–11:30.
- Don't write in capitals for emphasis; the type styles carry emphasis.

| Do                    | Don't                  |
| --------------------- | ---------------------- |
| Create project        | Create New Project     |
| Notification settings | Notification Settings: |
| Rename…               | Rename...              |

## Buttons and actions

- Label an action with a verb and its object: "Create project", "Export report", "Delete 3 documents". A verb alone works only where the object is plain from the place, such as "Save" at the end of a form about one thing.
- Keep one verb through a flow. The menu item "Delete project…", the dialog title "Delete Website refresh?" and the confirm button "Delete project" share it.
- Put the count in a label that acts on several things: "Archive 4 projects", not "Archive selected".
- Name a link after its destination: "Notification settings", "Read about roles". Never "Click here", "Learn more" or "here" on its own.

Choose between words that people confuse by what they mean:

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

Avoid "OK", "Yes" and "No", "Submit" and "Click here": they make people read the question again to know what the button does.

## Labels, descriptions and placeholders

- Make a label a short noun phrase, without a colon: "Project name", "Email address", "Due date".
- Mark the optional fields with "(optional)" after the label, not the required ones. Most fields of a well-made form are required, so asterisks would mark nearly everything.
- Put a format or a constraint in the description, where people read it before they type: "Lowercase letters, numbers and hyphens".
- Use a placeholder only for an example of the value, such as "name@example.com", or, in a select with nothing chosen yet, to name the choice to make, such as "Choose a team". Never use it for the label, or for instructions about the format or anything else that must stay; it disappears as people type or choose. A field needs no placeholder.

| Do                                                          | Don't                                                    |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Label "Description (optional)"                              | Label "Description\*", with every required field starred |
| Label "Handle", description "Lowercase letters and numbers" | Placeholder "Enter a handle (lowercase only)"            |

## Error messages

- Say what is wrong and how to fix it, in the field's own terms. Start with the fix where you can: "Enter an email address like name@example.com", "Enter a due date after the start date".
- Write no "Error:" prefix and no codes on their own. The tone and the icon already say it is an error; a code may follow the sentence for support, as "Reference 4F2A".
- Don't blame: "Choose a due date after 4 March 2026", not "You picked an invalid date".
- Title the list of a form's errors "There is a problem", and repeat each field's message in it, linked to the field.
- For a failure of the system, say what happened, whether people's work is safe and what to do: "Your changes weren't saved. Check your connection and try again."
- Show a field's error after people submit the form or leave the field, never while they type, and remove it as soon as the value is fixed.

| Do                                           | Don't                          |
| -------------------------------------------- | ------------------------------ |
| Enter an email address like name@example.com | Error: invalid input           |
| Enter a project name                         | Project name is required!      |
| Couldn't load projects. Try again.           | Error 503: Service Unavailable |

## Empty states

There are four kinds of empty, and each needs its own words. The title states the fact, the description says why or what next, and one action, at most, resolves it.

- **First use:** what the place is for, and the first action. "No projects yet" — "Projects bring files, tasks and people together." — "Create project".
- **No results:** name the query and offer to clear it. "No matching projects" — "No project names contain “roadmap”." — "Clear filters".
- **Done:** a factual title, without celebration. "No tasks left" — "New tasks assigned to you appear here."
- **Failed:** the danger tone and a way to try again. "Couldn't load projects" — "Your projects are safe. Check your connection and try again." — "Try again".

## Feedback and status

- Write a toast as one short sentence that says what happened to what, in the past tense: "Website refresh archived." Where the past tense says too little, as for a setting, say the state the change leaves instead: "Other people at Northwind can now find you in the directory." Offer one action at most, such as "Undo".
- Give an Alert a title that says the condition and one sentence on what it means or what to do: "This project is read-only" — "Ask an owner for edit access to change it."
- Name what is loading: "Loading projects", not "Loading…" or "Please wait".
- Count progress in the units people think in: "Uploading 3 of 5 files", "12 of 40 MB".
- Don't promise a time the interface can't know: no "Almost there" or "Just a second".

## Confirmations

- Ask the question in the title, naming the object: "Delete Website refresh?".
- Say the consequence in the description, with what else it affects and whether it can be undone: "This deletes the project and its 14 files for everyone. You can't undo this."
- Label the confirm button with the verb and the object of the title: "Delete project". Keep the other button "Cancel".
- Don't ask "Are you sure?": it names nothing, and people learn to press Yes without reading.

| Do                                         | Don't                        |
| ------------------------------------------ | ---------------------------- |
| Delete Website refresh? — "Delete project" | Are you sure? — "Yes" / "No" |

## Numbers, dates and time

- Format numbers, dates and times with `Intl` in the locale of [EnvUIProvider](../setup.md#locale-strings-and-direction), which `useLocale` returns, so they match envUI's own: `new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })`.
- Show a recent moment with [RelativeTime](../components/relative-time.md), "3 hours ago", which shows the date and time in its tooltip. Show a date further away, or one people plan by, as an absolute date: "4 Mar 2026".
- Build plurals from the count with a function, as envUI's own messages do (`toast.hidden({ count })`), or with `Intl.PluralRules`, never by adding "s": "1 file", "2 files".
- Keep a number and its unit on one line with a non-breaking space, U+00A0: "12 MB", "30 min".
- Write numbers as digits in the interface, "3 projects", and use the locale's separators: "12,400" in English.

## Inclusive and accessible wording

- Name the control, not where it is or how to press it: "Select Export", not "Click the button on the right" or "See below". People use keyboards, screen readers, touch and zoom.
- Use gender-neutral words: "they", "people", "everyone".
- Avoid idioms, metaphors and cultural references, which don't translate and don't read literally.
- Write alternative text for an image by its purpose: what it shows that matters here, in a sentence. A decorative image has none.
- Keep link and button text unique on a page, or name the object: "Edit Website refresh", "Edit Quarterly report".

## Ready for translation

- Write whole sentences with their values in them, never sentences built from pieces: one string "Archived {name}." rather than "Archived" + name + ".". Word order differs between languages.
- Leave room for text to grow by about 30%, and more in short labels; don't fit a label to its button.
- Pass every string envUI shows itself through EnvUIProvider's `messages`, in the application's language.
- Put no text in images or icons.

## Sample data

Examples, templates, screenshots and tests use one neutral set of sample data, so they look like a real application without naming one.

- **People:** Alex Morgan, Sam Lee, Priya Shah, Jordan Kim, Maria Garcia and Chen Wei, with email addresses at `example.com`, such as `alex.morgan@example.com`.
- **Organisation and application:** Northwind.
- **Things:** projects, such as Website refresh, Quarterly report, Onboarding guide, Mobile release, Data migration and Annual review; documents; tasks; teams.
- **Dates:** absolute dates in February and March 2026, so relative times read naturally.
- **No product names and no logos.** envUI never names the products that use it, in code, documentation, comments or sample data. Describe a behaviour instead of naming where it comes from.

## Related topics

- [Accessibility](../foundations/accessibility.md)
- [Typography](../foundations/typography.md)
- [TextField](../components/text-field.md)
- [EmptyState](../components/empty-state.md)
- [Toast](../components/toast.md)
- [ConfirmDialog](../components/confirm-dialog.md)
