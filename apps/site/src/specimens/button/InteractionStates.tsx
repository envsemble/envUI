import { Button } from '@envsemble/envui';
import { SpecimenFrame, MatrixScroll } from '../../figures/SpecimenFrame';

const variants = [
  { variant: 'primary', name: 'Primary', label: 'Continue' },
  { variant: 'secondary', name: 'Secondary', label: 'Cancel' },
  { variant: 'outline', name: 'Outline', label: 'Manage' },
  { variant: 'ghost', name: 'Ghost', label: 'Settings' },
  { variant: 'text', name: 'Text', label: 'Learn more' },
] as const;

const states = [
  { title: 'Default', className: 'catalogue-force-default', disabled: false },
  { title: 'Hover', className: 'catalogue-force-hover', disabled: false },
  { title: 'Pressed', className: 'catalogue-force-pressed', disabled: false },
  { title: 'Keyboard focus', className: 'catalogue-force-focus', disabled: false },
  { title: 'Disabled', className: 'catalogue-force-disabled', disabled: true },
];

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
