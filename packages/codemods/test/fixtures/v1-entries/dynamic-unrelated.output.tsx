// A file that loads the entry point at run time but names nothing that moved is left alone.
export const loadButton = () => import('@envsemble/envui').then((module) => module.Button);
