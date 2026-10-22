// Type tests: tsc checks this file (tests/types/tsconfig.json) against envUI's source. Each
// expected error below must occur, so a variant and tone pair that isn't designed must fail to
// type-check; the other elements must type-check.
import {
  Button,
  ConfirmButton,
  CopyButton,
  IconButton,
  ThemeToggle,
  type ButtonVariant,
} from '@envsemble/envui';

const icon = <span />;
const noop = () => {};

/** Every designed pair, and each component's default. */
export const designed = (
  <>
    <Button>Save</Button>
    <Button tone="accent">Publish</Button>
    <Button tone="danger">Delete</Button>
    <Button variant="secondary">Cancel</Button>
    <Button variant="outline" tone="danger">
      Remove
    </Button>
    <Button variant="ghost" tone="danger">
      Discard
    </Button>
    <Button variant="text" tone="danger" underline>
      Forget
    </Button>
    <IconButton icon={icon} aria-label="Settings" />
    <IconButton variant="secondary" tone="neutral" icon={icon} aria-label="Settings" />
    <IconButton variant="primary" tone="accent" icon={icon} aria-label="Add" />
    <IconButton variant="ghost" tone="danger" icon={icon} aria-label="Delete" />
    <ConfirmButton confirmLabel="Remove?" onConfirm={noop}>
      Remove
    </ConfirmButton>
    <ConfirmButton tone="danger" confirmLabel="Remove?" onConfirm={noop}>
      Remove
    </ConfirmButton>
    <ConfirmButton variant="primary" tone="accent" confirmLabel="Publish?" onConfirm={noop}>
      Publish
    </ConfirmButton>
    <ConfirmButton icon={icon} aria-label="Remove" confirmLabel="Remove?" onConfirm={noop} />
    <ConfirmButton
      variant="ghost"
      tone="danger"
      icon={icon}
      aria-label="Remove"
      confirmLabel="Remove?"
      onConfirm={noop}
    />
    <CopyButton value="text" aria-label="Copy link" />
    <CopyButton value="text" variant="ghost" tone="danger" aria-label="Copy link" />
    <ThemeToggle variant="ghost" />
  </>
);

// @ts-expect-error A secondary button is neutral.
export const secondaryDanger = <Button variant="secondary" tone="danger" />;
// @ts-expect-error Only a primary button takes accent.
export const outlineAccent = <Button variant="outline" tone="accent" />;
// @ts-expect-error Without a variant an IconButton is secondary, which is neutral.
export const iconButtonDanger = <IconButton tone="danger" icon={icon} aria-label="Delete" />;
// @ts-expect-error Without a variant an IconButton is secondary, which is neutral.
export const iconButtonAccent = <IconButton tone="accent" icon={icon} aria-label="Add" />;
export const confirmSecondaryAccent = (
  // @ts-expect-error A secondary button is neutral, also at rest.
  <ConfirmButton variant="secondary" tone="accent" confirmLabel="Remove?" onConfirm={noop}>
    Remove
  </ConfirmButton>
);
export const confirmDefaultAccent = (
  // @ts-expect-error Without a variant a ConfirmButton rests outline, which has no accent.
  <ConfirmButton tone="accent" confirmLabel="Remove?" onConfirm={noop}>
    Remove
  </ConfirmButton>
);
export const confirmIconDanger = (
  // @ts-expect-error Without a variant an icon-only ConfirmButton rests secondary, which is neutral.
  <ConfirmButton
    tone="danger"
    icon={icon}
    aria-label="Remove"
    confirmLabel="Remove?"
    onConfirm={noop}
  />
);
// @ts-expect-error Without a variant a CopyButton is secondary, which is neutral.
export const copyDanger = <CopyButton value="text" tone="danger" aria-label="Copy link" />;
export const copySecondaryDanger = (
  // @ts-expect-error A secondary button is neutral.
  <CopyButton value="text" variant="secondary" tone="danger" aria-label="Copy link" />
);
// @ts-expect-error A ThemeToggle is an IconButton: secondary without a variant, which is neutral.
export const toggleDanger = <ThemeToggle tone="danger" />;

/**
 * A variant typed as a union of variants, as a conditional or a variable gives it, takes the tones
 * that every variant in it takes.
 */
declare const pressed: boolean;
declare const variant: 'primary' | 'secondary';
declare const anyVariant: ButtonVariant;
declare const strong: 'primary' | 'outline';
export const unions = (
  <>
    <Button variant={pressed ? 'primary' : 'secondary'}>Show</Button>
    <Button variant={variant}>Show</Button>
    <Button variant={variant} tone="neutral" href="/changes">
      Show
    </Button>
    <Button variant={anyVariant}>Show</Button>
    <Button variant={strong} tone="danger">
      Delete
    </Button>
    <IconButton variant={variant} icon={icon} aria-label="Settings" />
    <IconButton variant={strong} tone="danger" icon={icon} aria-label="Delete" />
    <ConfirmButton variant={variant} confirmLabel="Remove?" onConfirm={noop}>
      Remove
    </ConfirmButton>
    <CopyButton value="text" variant={variant} aria-label="Copy link" />
    <IconButton variant={anyVariant} icon={icon} aria-label="Settings" />
    <IconButton href="/settings" variant="ghost" icon={icon} aria-label="Settings" />
    {/* @ts-expect-error IconButton is the one icon-only button. */}
    <Button iconOnly icon={icon} aria-label="Settings" />
  </>
);

// @ts-expect-error A secondary button is neutral, so a union with secondary is too.
export const unionDanger = <Button variant={variant} tone="danger" />;
// @ts-expect-error Only a primary button takes accent.
export const unionAccent = <Button variant={strong} tone="accent" />;
export const iconUnionAccent = (
  // @ts-expect-error Only a primary button takes accent.
  <IconButton variant={strong} tone="accent" icon={icon} aria-label="Add" />
);
