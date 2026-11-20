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

Sentence case everywhere, and no full stop on a label, button, title, tab or menu item. An ellipsis (…) ends an action that asks for more before it acts, such as a button that opens a dialog: "Rename…". Name a button by its verb and object, "Export report", and a link by its destination. `envui/label-vocabulary`, in the ESLint plugin's `configs.strict`, reports in a label each word the table below replaces.

## Buttons and actions

| Word      | Means                                                                     | Not                                    |
| --------- | ------------------------------------------------------------------------- | -------------------------------------- |
| Create    | Make something new: "Create project".                                     | Add, for something new                 |
| Add       | Put something that exists into something else: "Add Sam Lee to the team". | Create                                 |
| Delete    | Remove for good: the thing is gone.                                       | Remove, when the thing is gone         |
| Remove    | Take out of a place; the thing remains: "Remove from team".               | Delete, when the thing remains         |
| Save      | Keep changes made in a form or a document.                                | Submit, for keeping changes, OK        |
| Apply     | Use settings or filters and stay where you are.                           | Save, for filters                      |
| Done      | Finish a task or close a panel after changes that are already kept.       | OK                                     |
| Cancel    | Abandon what is in progress, changes included.                            | Close, when changes would be lost      |
| Close     | Dismiss something with nothing pending.                                   | Cancel, when nothing is lost           |
| Edit      | Change the content of something.                                          | Modify, Update, for changing content   |
| Rename    | Change only the name.                                                     | Edit, for a name alone                 |
| Duplicate | Make a copy beside the original.                                          | Clone, Copy (Copy puts on a clipboard) |
| Archive   | Put out of the way, restorable.                                           | Delete, Hide, for putting away         |
| Restore   | Bring back something archived or deleted.                                 | Undelete, Recover, for deleted things  |
| Sign in   | Start a session; the noun and the verb are the same. "Sign out" ends it.  | Log in, Login, Log out                 |
| Continue  | Go on to the next step of a flow; "Back" returns.                         | Proceed, Next, for a step of a flow    |
| Try again | Repeat something that failed.                                             | Retry, Reload, after a failure         |
| Undo      | Reverse what just happened.                                               | Revert, for what just happened, Cancel |
| Export    | Turn data into a file in another format.                                  | Download, for a conversion             |
| Download  | Copy a file that exists to the device.                                    | Export, for a file that exists         |
| Invite    | Ask someone to join.                                                      | Add, for someone not yet a member      |
| Share     | Give others access or a link.                                             | Send or Publish, for giving access     |

## Numbers and translation

Format numbers and dates with `Intl` in the locale `useLocale` returns, and recent moments with [RelativeTime](components/relative-time.md). Write whole sentences with their values in them, never built from pieces, and leave room for text to grow.
