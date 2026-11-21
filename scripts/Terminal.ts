export const showsColor = Boolean(process.stdout.isTTY && !process.env.NO_COLOR);
const paint = (code: number, text: string) =>
  showsColor ? `\u001b[${code}m${text}\u001b[0m` : text;
export const red = (text: string) => paint(31, text);
export const green = (text: string) => paint(32, text);
export const yellow = (text: string) => paint(33, text);
export const dim = (text: string) => paint(2, text);
export const bold = (text: string) => paint(1, text);
