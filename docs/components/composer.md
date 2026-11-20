---
title: Composer
summary: The message field of a conversation, which grows with its text.
status: stable
since: 1.0.0
category: Text & content
aliases:
  - ChatInput
  - PromptInput
  - chat input
  - chat box
  - prompt input
  - prompt box
  - message input
  - message box
  - reply field
  - comment box
useWhen:
  - A message in a conversation, such as a chat, a comment or a prompt
  - A reply that runs after a send, which people may stop
avoidWhen:
  - text: Text over several lines in a form, where Enter starts a new line.
    use: Textarea
  - text: The messages of the conversation itself.
    use: Message
components:
  - Composer
examples:
  AskAnything:
    role: overview
    motion: true
  StartAndFooter: example
  AttachmentsAndVoice: example
  ComposerAnatomy: anatomy
  PendingSend: example
  GrowingDraft: example
---

# Composer

## Variants

### Layouts

```tsx figure=StartAndFooter

```

### Above the field and before Send

```tsx figure=AttachmentsAndVoice

```

## Anatomy

```tsx figure=ComposerAnatomy

```

1. **Composer** (`env-composer`)
2. **Surface** (`env-composer-surface`)
3. **Input** (`env-composer-input`)
4. **Start** (`env-composer-start`, `start`)
5. **Send** (`env-composer-action`)
6. **Footer** (`env-composer-footer`, `description`)

## Behaviour

### Pending send

```tsx figure=PendingSend motion

```

### Adapting to width

```tsx figure=GrowingDraft widths="36 18" sweep

```

## Accessibility

### Keyboard

| Key                                                                            | Action                                                                                |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> in the field                                                  | Sends the message, unless it is blank, pending or running.                            |
| <kbd>Shift</kbd>+<kbd>Enter</kbd> in the field                                 | Starts a new line.                                                                    |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>⌘</kbd>+<kbd>Enter</kbd> in the field | In a composer that sends with a modifier, sends the message; Enter starts a new line. |
