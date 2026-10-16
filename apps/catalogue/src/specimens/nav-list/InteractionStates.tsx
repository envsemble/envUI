import { Disclosure, NavList } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { controlStates } from '../../previews/InteractionStates';

/** Selected and unselected items forced into their hover, pressed, focus and disabled looks. */
export default function InteractionStates() {
  return (
    <Example size="wide">
      <Disclosure title="Interaction states">
        <div
          className="docs-matrix-scroll"
          tabIndex={0}
          role="region"
          aria-label="Navigation item interaction states"
        >
          <table className="docs-matrix">
            <thead>
              <tr>
                <th scope="col">Selection</th>
                {controlStates.map((state) => (
                  <th scope="col" key={state.title}>
                    {state.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[false, true].map((selected) => (
                <tr key={String(selected)}>
                  <th scope="row">{selected ? 'Selected' : 'Unselected'}</th>
                  {controlStates.map((state) => (
                    <td key={state.title}>
                      <NavList.Item
                        selected={selected}
                        disabled={state.disabled}
                        className={state.className}
                        inert
                      >
                        Home
                      </NavList.Item>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Disclosure>
    </Example>
  );
}
