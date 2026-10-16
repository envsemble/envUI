/**
 * The English defaults of the `message` messages: Message. EnvUIProvider's `messages.message`
 * overrides any of them.
 */
export const message = {
  /** The status of a message on its way. */
  sending: 'Sending',
  /** The status of a message that could not be sent. */
  failed: 'Not sent',
};

export type MessageMessages = typeof message;
