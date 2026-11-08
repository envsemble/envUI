// A style sheet imported as its text, as dev mode imports its own: `import text from './DevMode.css?raw'`.
declare module '*.css?raw' {
  const text: string;
  export default text;
}
