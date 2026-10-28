import SliderAnatomy from '../../examples/slider/SliderAnatomy';

/** The anatomy's slider as under the pointer, so its handle, which shows only then, is there. */
export default function SliderAnatomyHeld() {
  return (
    <div className="catalogue-force-handle">
      <SliderAnatomy />
    </div>
  );
}
