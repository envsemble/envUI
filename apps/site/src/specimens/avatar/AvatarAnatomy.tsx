import AvatarAnatomy from '../../examples/avatar/AvatarAnatomy';

/**
 * The anatomy's group held spread, as under the pointer, and level, so the avatars fill the group's room and
 * its callout meets them rather than the room the pile leaves at its end.
 */
export default function AvatarAnatomyHeld() {
  return (
    <div className="catalogue-force-spread">
      <AvatarAnatomy />
    </div>
  );
}
