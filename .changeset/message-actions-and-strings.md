---
'@envsemble/envui': major
---

Message's actions are small ghost buttons by default, and its statuses come from messages.

- A Button or IconButton in `actions` without a variant or size of its own is a small ghost button; one that sets them keeps them. A text IconButton at the edge still lines its icon up with the message, now through Button's `--env-button-text-icon-edge-start` and `-end` hooks.
- The statuses are `messages.message.sending` and `.failed`; `statusLabel` still overrides them for one message. Message stays a server component and renders its status text in a client leaf.
- The spinner of a sending message takes its color through Spinner's `--env-spinner-color` hook.

Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).
