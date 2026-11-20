export const supportsFieldSizing = (input: HTMLTextAreaElement) =>
  input.ownerDocument.defaultView?.CSS?.supports('field-sizing', 'content');
