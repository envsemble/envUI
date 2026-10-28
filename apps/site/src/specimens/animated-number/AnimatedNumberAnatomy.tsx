import AnimatedNumberAnatomy from '../../examples/animated-number/AnimatedNumberAnatomy';

/**
 * The anatomy's number caught as its value rolls in, so the number and its value show apart: the
 * value below the line, cut off where the number ends.
 */
export default function AnimatedNumberAnatomyHeld() {
  return (
    <div className="catalogue-force-rolling">
      <AnimatedNumberAnatomy />
    </div>
  );
}
