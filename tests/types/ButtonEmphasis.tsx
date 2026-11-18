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

export const designedPairsAndDefaults = (
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
    <ConfirmButton confirmLabel="Remove" onConfirm={noop}>
      Remove
    </ConfirmButton>
    <ConfirmButton tone="danger" confirmLabel="Remove" onConfirm={noop}>
      Remove
    </ConfirmButton>
    <ConfirmButton variant="primary" tone="accent" confirmLabel="Publish" onConfirm={noop}>
      Publish
    </ConfirmButton>
    <ConfirmButton icon={icon} aria-label="Remove" confirmLabel="Remove" onConfirm={noop} />
    <ConfirmButton
      variant="ghost"
      tone="danger"
      icon={icon}
      aria-label="Remove"
      confirmLabel="Remove"
      onConfirm={noop}
    />
    <CopyButton value="text" aria-label="Copy link" />
    <CopyButton value="text" variant="ghost" tone="danger" aria-label="Copy link" />
    <ThemeToggle variant="ghost" />
  </>
);

// @ts-expect-error
export const secondaryIsNeutral = <Button variant="secondary" tone="danger" />;
// @ts-expect-error
export const onlyPrimaryTakesAccent = <Button variant="outline" tone="accent" />;
// @ts-expect-error
export const iconButtonIsSecondary = <IconButton tone="danger" icon={icon} aria-label="Delete" />;
// @ts-expect-error
export const iconButtonHasNoAccent = <IconButton tone="accent" icon={icon} aria-label="Add" />;
export const secondaryConfirmIsNeutralAtRest = (
  // @ts-expect-error
  <ConfirmButton variant="secondary" tone="accent" confirmLabel="Remove" onConfirm={noop}>
    Remove
  </ConfirmButton>
);
export const confirmRestsOutlineWithoutAccent = (
  // @ts-expect-error
  <ConfirmButton tone="accent" confirmLabel="Remove" onConfirm={noop}>
    Remove
  </ConfirmButton>
);
export const iconOnlyConfirmRestsNeutralSecondary = (
  // @ts-expect-error
  <ConfirmButton
    tone="danger"
    icon={icon}
    aria-label="Remove"
    confirmLabel="Remove"
    onConfirm={noop}
  />
);
// @ts-expect-error
export const copyIsSecondary = <CopyButton value="text" tone="danger" aria-label="Copy link" />;
export const secondaryCopyIsNeutral = (
  // @ts-expect-error
  <CopyButton value="text" variant="secondary" tone="danger" aria-label="Copy link" />
);
// @ts-expect-error
export const themeToggleIsNeutralSecondaryIconButton = <ThemeToggle tone="danger" />;

declare const pressed: boolean;
declare const variant: 'primary' | 'secondary';
declare const anyVariant: ButtonVariant;
declare const strong: 'primary' | 'outline';
export const unionVariantTakesTheTonesEveryVariantTakes = (
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
    <ConfirmButton variant={variant} confirmLabel="Remove" onConfirm={noop}>
      Remove
    </ConfirmButton>
    <CopyButton value="text" variant={variant} aria-label="Copy link" />
    <IconButton variant={anyVariant} icon={icon} aria-label="Settings" />
    <IconButton href="/settings" variant="ghost" icon={icon} aria-label="Settings" />
    <IconButton icon={icon} aria-labelledby="settings-heading" />
  </>
);
export const iconButtonIsTheOneIconOnlyButton = (
  // @ts-expect-error
  <Button iconOnly icon={icon} aria-label="Settings" />
);

// @ts-expect-error
export const unionWithSecondaryIsNeutral = <Button variant={variant} tone="danger" />;
// @ts-expect-error
export const unionWithOutlineHasNoAccent = <Button variant={strong} tone="accent" />;
export const iconButtonUnionWithOutlineHasNoAccent = (
  // @ts-expect-error
  <IconButton variant={strong} tone="accent" icon={icon} aria-label="Add" />
);

// @ts-expect-error
export const iconButtonNeedsAName = <IconButton icon={icon} />;
