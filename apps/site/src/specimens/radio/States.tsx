import { Radio, RadioGroup } from '@envsemble/envui';
import { Example, MatrixScroll } from '../../previews/Example';

/** Unchosen and chosen, enabled and disabled. */
export default function States() {
  return (
    <Example size="wide">
      <MatrixScroll label="Radio states">
        <table className="catalogue-matrix">
          <thead>
            <tr>
              <th scope="col">State</th>
              <th scope="col">Unchosen</th>
              <th scope="col">Chosen</th>
            </tr>
          </thead>
          <tbody>
            {[false, true].map((disabled) => (
              <tr key={String(disabled)}>
                <th scope="row">{disabled ? 'Disabled' : 'Enabled'}</th>
                {[false, true].map((chosen) => (
                  <td key={String(chosen)}>
                    <RadioGroup
                      aria-label={`${chosen ? 'Chosen' : 'Unchosen'} radio`}
                      value={chosen ? 'team' : ''}
                      disabled={disabled}
                      inert
                    >
                      <Radio value="team" label="Team" />
                    </RadioGroup>
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
