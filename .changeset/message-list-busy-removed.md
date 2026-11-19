---
'@envsemble/envui': major
---

MessageList: a reply on its way is a Message with `status="working"`, rendered last, with the list's `aria-busy` set while it streams in. It lines up with the other messages, takes the agent's Avatar in `start`, and a Stop button in its `actions` reaches the keyboard and assistive technology, which the hidden busy row did not. See [Message](https://github.com/envsemble/envUI/blob/main/docs/components/message.md).

Breaking changes:

- MessageList's `busy`, `busyAuthor` and `busyLabel` are removed, with the part `env-message-list-busy`: write `aria-busy={replying}` on the MessageList and, last in it, `<Message from="other" author="Agent" status="working" statusLabel="Thinking">{replySoFar}</Message>`.
