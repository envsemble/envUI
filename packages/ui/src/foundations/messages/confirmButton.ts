/**
 * The English defaults of the `confirmButton` messages: ConfirmButton. EnvUIProvider's
 * `messages.confirmButton` overrides any of them.
 */
export const confirmButton = {
  /** Announced when the button arms, after its confirm label. */
  armed: 'Press again to confirm.',
};

export type ConfirmButtonMessages = typeof confirmButton;
