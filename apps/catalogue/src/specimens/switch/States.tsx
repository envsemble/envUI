import { Switch } from '@envsemble/envui';
import { Example } from '../../previews/Example';

/** Off and on, enabled and disabled. */
export default function States() {
  return (
    <Example size="wide">
      <div className="docs-matrix-scroll" tabIndex={0} role="region" aria-label="Switch states">
        <table className="docs-matrix">
          <thead>
            <tr>
              <th scope="col">State</th>
              <th scope="col">Off</th>
              <th scope="col">On</th>
            </tr>
          </thead>
          <tbody>
            {[false, true].map((disabled) => (
              <tr key={String(disabled)}>
                <th scope="row">{disabled ? 'Disabled' : 'Enabled'}</th>
                {[false, true].map((checked) => (
                  <td key={String(checked)}>
                    <Switch label="Reminders" checked={checked} disabled={disabled} inert />
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
