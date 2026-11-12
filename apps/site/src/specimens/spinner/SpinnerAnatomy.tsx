import SpinnerAnatomy from '../../examples/spinner/SpinnerAnatomy';

/**
 * The anatomy's spinner held at one moment of its turn, a long arc round its top and start, so the
 * arc's callout meets the stroke rather than the gap.
 */
export default function SpinnerAnatomyHeld() {
  return (
    <div className="catalogue-force-arc">
      <SpinnerAnatomy />
    </div>
  );
}
