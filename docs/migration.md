# Move an app to envUI

Bring an application with a UI of its own onto envUI a slice at a time, keeping what it does while its controls and look change.

## Look before you replace

- Note the React version, the bundler, the router, how pages render, and how the app builds and deploys.
- Find the shared UI: wrappers, the component library, icon loaders, fonts, global CSS, tokens and resets.
- Find what holds state: the theme preference, providers, the roots of dialogs and toasts, and forms with validation, drafts and pending saves.
- Note vendor widgets that need their own styles or peers.
- Read the behaviour, not only the look: two controls that look alike may behave differently.

## Connect envUI

Install an exact release and follow [setup](setup.md): the registry, styles, `Theme` and the entry points. While old and new styles live side by side, put the application's resets and element rules in a layer before envUI's, as [cascade layers](customizing.md#cascade-layers) shows, so they don't restyle envUI's components.

## Move one responsibility at a time

Start with a small slice that takes in routing, a form or an overlay, not only a static button, then widen it through its callers. Read the page of each component before you adopt it:

| What the application has                        | What envUI offers                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| Text, panels, vertical layouts, rows of actions | Text, Surface, Column, Row, Grid                                                  |
| Buttons, inline links, icon buttons             | Button, Link, IconButton, ButtonGroup                                             |
| Side navigation and the current destination     | NavigationBar, NavigationRail or NavigationDrawer, with `current` from the router |
| Cards                                           | Card                                                                              |
| Fields and choices                              | TextField, Textarea, Select, Checkbox, RadioGroup, Switch                         |
| Dialogs, inspectors and notifications           | Dialog, Sheet, ToastProvider with useToast                                        |
| Loading and empty results                       | `skeleton`, Spinner with `showLabel`, empty states                                |
| Code, Markdown and formatted text               | The content and rich-text entries                                                 |

- Move behaviour, not props: keep labels and accessible names, links and router state, callback payloads, refs, form names and reset, where focus returns, and when a change is saved.
- Check the type of each button inside a form, and whether a dialog may close while its work is pending.
- Where envUI has nothing for a need, compose its components only if the interaction survives; otherwise keep the working implementation and note the gap.
- Treat stored rich text as data: try real documents before switching editors.

## Remove what you replaced

Once nothing imports them, delete the old wrappers, style sheets, fonts, icon pipelines and vendor peers; search for remaining imports first. Keep a vendor widget's own theme, scoped to that widget, while it stays. Update project instructions that still point to the old UI.

## Check it

Run the application's checks and its production build. In a browser, walk the journeys you changed: light and dark, the keyboard, narrow windows, collapsed navigation, enlarged text, and the dialogs, forms and links on the way. The lint packages in [setup](setup.md) report raw elements and colors envUI provides.
