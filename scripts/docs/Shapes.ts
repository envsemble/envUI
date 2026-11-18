export const isMap = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export type Reader<T> = (value: unknown, where: string) => T;

const fail = (where: string, what: string): never => {
  throw new Error(`${where} must be ${what}`);
};

export const text: Reader<string> = (value, where) =>
  typeof value === 'string' ? value : fail(where, 'text');

export const yesNo: Reader<boolean> = (value, where) =>
  typeof value === 'boolean' ? value : fail(where, 'true or false');

export const textOrYesNo: Reader<string | boolean> = (value, where) =>
  typeof value === 'string' || typeof value === 'boolean'
    ? value
    : fail(where, 'text or a boolean');

export const oneOf =
  <T extends string>(values: readonly T[]): Reader<T> =>
  (value, where) =>
    values.find((item) => item === value) ?? fail(where, `one of ${values.join(', ')}`);

export const optional =
  <T>(read: Reader<T>): Reader<T | undefined> =>
  (value, where) =>
    value === undefined ? undefined : read(value, where);

export const listOf =
  <T>(read: Reader<T>): Reader<T[]> =>
  (value, where) =>
    Array.isArray(value)
      ? value.map((item, index) => read(item, `${where}[${index}]`))
      : fail(where, 'a list');

export const mapOf =
  <T>(read: Reader<T>): Reader<Record<string, T>> =>
  (value, where) =>
    isMap(value)
      ? Object.fromEntries(
          Object.entries(value).map(([name, item]) => [name, read(item, `${where}.${name}`)]),
        )
      : fail(where, 'a map');

export const fields =
  <T extends object>(readers: { [K in keyof T]-?: Reader<T[K]> }): Reader<T> =>
  (value, where) => {
    if (!isMap(value)) return fail(where, 'a map');
    const result: Partial<T> = {};
    for (const key of Object.keys(readers) as (keyof T & string)[]) {
      const read = readers[key](value[key], `${where}.${key}`);
      if (read !== undefined) result[key] = read;
    }
    return result as T;
  };
