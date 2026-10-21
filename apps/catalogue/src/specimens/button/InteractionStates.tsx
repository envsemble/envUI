import { Disclosure } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { controlStates } from '../../previews/InteractionStates';
import { ButtonSample, buttonVariants, pairName } from '../../previews/ButtonSamples';

/** Every variant forced into its hover, pressed, focus and disabled looks, for review. */
export default function InteractionStates() {
  return (
    <Example size="wide">
      <Disclosure title="Interaction states">
        <div
          className="docs-matrix-scroll"
          tabIndex={0}
          role="region"
          aria-label="Button interaction states"
        >
          <table className="docs-matrix">
            <thead>
              <tr>
                <th scope="col">Variant</th>
                {controlStates.map((state) => (
                  <th scope="col" key={state.title}>
                    {state.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buttonVariants.map((example) => (
                <tr key={pairName(example)}>
                  <th scope="row">{pairName(example)}</th>
                  {controlStates.map((state) => (
                    <td key={state.title}>
                      <ButtonSample
                        example={example}
                        form="label"
                        className={state.className}
                        disabled={state.disabled}
                        inert
                      />
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
