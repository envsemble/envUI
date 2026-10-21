import { Example } from '../../previews/Example';
import { controlStates } from '../../previews/InteractionStates';
import { ButtonSample, buttonVariants, pairName } from '../../previews/ButtonSamples';

/** Each variant forced into its hover, pressed, focus and disabled looks. */
export default function InteractionStates() {
  return (
    <Example size="wide">
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
            {buttonVariants
              .filter((example) => example.tone === 'neutral')
              .map((example) => (
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
    </Example>
  );
}
