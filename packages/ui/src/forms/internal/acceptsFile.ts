/**
 * Whether a file matches an accept list as the native file input reads it: MIME types such as
 * image/png, groups such as image/*, and file name extensions such as .webp, separated by commas.
 */
export function acceptsFile(file: File, accept: string | undefined) {
  const patterns = (accept ?? '')
    .split(',')
    .map((pattern) => pattern.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0) return true;
  const fileName = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return fileName.endsWith(pattern);
    if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
    return type === pattern;
  });
}
