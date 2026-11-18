---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

EmptyState is a component again, MessageList can follow a conversation, and the content and feedback components place what you give their slots without restyling it.

- New: `EmptyState`, what a region shows when it has nothing to show: an optional `icon`, a `title`, an optional `description` and optional `actions`. It fills its region and centres in it, and is compact where the region is narrow. CommandPalette's empty state is now an EmptyState, its icon above its title.
- New: `follow` on MessageList makes the list scroll by itself: it opens at the latest message, keeps it in view while the reader is at the end, and shows a Jump to latest button once they scroll away and more arrives (`jumpToLatestLabel`, or `messages.message.jumpToLatest`). Give it a height, such as the rest of a column above a Composer.
- Composer's focus is its 1 px edge in the focus color, instead of a doubled accent border.
- Message's `meta`, `actions` and content, Alert's message and actions, Composer's `start` and `description`, Disclosure's and Accordion's titles, and CommandPalette's footer and hint labels render through a slot that places their content and leaves its text, color and spacing to it. A text action at a message's edge no longer lines its icon up with the message.

Breaking changes:

- Message's `author`, MessageList's `busyAuthor` and Alert's `title` take a `string`; put richer content in `meta` or the message.
- The state attribute `data-text` on `env-message-content` is removed; plain text is in the new part `env-message-text`.
- The parts `env-command-palette-empty-icon`, `env-command-palette-empty-title` and `env-command-palette-empty-description` are removed; style the EmptyState's parts, `env-empty-state-icon`, `env-empty-state-title` and `env-empty-state-description`, inside `env-command-palette-status`.
- Content in a message no longer loses the top margin of its first child and the bottom margin of its last; give formatted content its own spacing, as Markdown does.
