// Renders React elements as a React Server Components server does, far enough to check what
// envUI's server modules do there: server components run (without hooks, which React's server build
// lacks), client references stay references, and every prop that reaches a client component or an
// element must be serializable. Prints the rendered tree as JSON, or the first problem.
import { Fragment } from 'react';

const clientReference = Symbol.for('react.client.reference');
const forwardRef = Symbol.for('react.forward_ref');
const memo = Symbol.for('react.memo');
const element = Symbol.for('react.transitional.element');

/** A prop value as the server would send it; throws for one it cannot send. */
function serialize(value, path) {
  if (typeof value === 'function')
    throw new Error(`${path} is a function, which a server cannot pass to the client.`);
  if (typeof value === 'symbol') throw new Error(`${path} is a symbol.`);
  if (value?.$$typeof === element) return render(value, path);
  if (Array.isArray(value)) return value.map((item, index) => serialize(item, `${path}[${index}]`));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serialize(item, `${path}.${key}`)]),
    );
  return value;
}

/** The server's output for a node. */
export function render(node, path = 'root') {
  if (node == null || typeof node === 'boolean') return null;
  if (typeof node === 'string' || typeof node === 'number') return node;
  if (Array.isArray(node)) return node.map((child, index) => render(child, `${path}[${index}]`));
  if (node.$$typeof !== element) throw new Error(`${path} is not a React node.`);
  const { type, props } = node;
  if (type === Fragment) return render(props.children, path);
  if (typeof type === 'string') return { element: type, props: serialize(props, `<${type}>`) };
  if (type.$$typeof === clientReference)
    return { client: type.$$id.replace(/^.*\/dist\//, ''), props: serialize(props, type.$$id) };
  const name = type.displayName ?? type.name ?? 'component';
  if (type.$$typeof === forwardRef) return render(type.render(props, null), name);
  if (type.$$typeof === memo) return render({ ...node, type: type.type }, name);
  if (typeof type === 'function') return render(type(props), name);
  throw new Error(`${path} renders an element type the server cannot render.`);
}
