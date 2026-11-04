import { Checkbox } from '@envsemble/envui';
import { Example, MatrixScroll } from '../../figures/Example';

const states = [
  { title: 'Unchecked', checked: false },
  { title: 'Checked', checked: true },
  { title: 'Mixed', checked: 'mixed' },
] as const;

/** Each state, enabled and disabled. */
export default function States() {
  return (
    <Example size="wide">
      <MatrixScroll label="Checkbox states">
        <table className="catalogue-matrix">
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
      </MatrixScroll>
    </Example>
  );
}
