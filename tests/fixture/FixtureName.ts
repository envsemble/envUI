export const fixtureName = (file: string) =>
  file
    .replace(/^.*\//, '')
    .replace(/\.fixture\.tsx$/, '')
    .replace(/(?<=[a-z0-9])(?=[A-Z])/g, '-')
    .toLowerCase();
