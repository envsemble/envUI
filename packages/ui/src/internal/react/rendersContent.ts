/** Whether a slot's content renders anything: anything but null, undefined and false. */
export function rendersContent<Node>(node: Node): node is Exclude<Node, null | undefined | false> {
  return node != null && node !== false;
}
