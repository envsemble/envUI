import { Button } from '@envsemble/envui';
import { SpecimenFrame, MatrixScroll } from '../../figures/SpecimenFrame';

/** Each variant in its neutral tone, with the label its row shows it with. */
const variants = [
  { variant: 'primary', name: 'Primary', label: 'Continue' },
  { variant: 'secondary', name: 'Secondary', label: 'Cancel' },
  { variant: 'outline', name: 'Outline', label: 'Manage' },
  { variant: 'ghost', name: 'Ghost', label: 'Settings' },
  { variant: 'text', name: 'Text', label: 'Learn more' },
] as const;

/** The states a control is forced into, each by its class (InteractionStates.css). */
const states = [
  { title: 'Default', className: 'catalogue-force-default', disabled: false },
  { title: 'Hover', className: 'catalogue-force-hover', disabled: false },
  { title: 'Pressed', className: 'catalogue-force-pressed', disabled: false },
  { title: 'Keyboard focus', className: 'catalogue-force-focus', disabled: false },
  { title: 'Disabled', className: 'catalogue-force-disabled', disabled: true },
];

/** Each variant forced into its hover, pressed, focus and disabled looks. */
export default function InteractionStates() {
  return (
    <SpecimenFrame size="wide" still>
      <MatrixScroll label="Button interaction states">
        <table className="catalogue-matrix">
          <thead>
            <tr>
              <th scope="col">Variant</th>
              {states.map((state) => (
                <th scope="col" key={state.title}>
                  {state.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map(({ variant, name, label }) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                {states.map((state) => (
                  <td key={state.title}>
                    <Button
                      variant={variant}
                      tone="neutral"
                      className={state.className}
                      disabled={state.disabled}
                      inert
                    >
                      {label}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </MatrixScroll>
    </SpecimenFrame>
  );
}
