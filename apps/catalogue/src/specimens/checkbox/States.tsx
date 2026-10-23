import { Checkbox } from '@envsemble/envui';
import { Example } from '../../previews/Example';

const states = [
  { title: 'Unchecked', checked: false },
  { title: 'Checked', checked: true },
  { title: 'Mixed', checked: 'mixed' },
] as const;

/** Each state, enabled and disabled. */
export default function States() {
  return (
    <Example size="wide">
      <div className="docs-matrix-scroll" tabIndex={0} role="region" aria-label="Checkbox states">
        <table className="docs-matrix">
          <thead>
            <tr>
              <th scope="col">State</th>
              {states.map(({ title }) => (
                <th scope="col" key={title}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[false, true].map((disabled) => (
              <tr key={String(disabled)}>
                <th scope="row">{disabled ? 'Disabled' : 'Enabled'}</th>
                {states.map(({ title, checked }) => (
                  <td key={title}>
                    <Checkbox label="Archived" checked={checked} disabled={disabled} inert />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Example>
  );
}
