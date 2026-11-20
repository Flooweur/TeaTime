/** JSON helpers: the content's hash and the state's comparisons rest on them. */

/**
 * Strings in their UTF-16 code units' order, the same on every device (never a locale's): the
 * order canonical JSON's keys take, and the order ids and dates sort in.
 */
export const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * A canonical JSON text (ported from EagleEye's `json.ts`): object keys sorted by code unit, no
 * whitespace, numbers and strings as `JSON.stringify` writes them (the rules of RFC 8785). Equal
 * data gives equal text whatever the key order, so it serves to compare and to hash. Keys whose
 * value is `undefined` are left out, as `JSON.stringify` does. Anything that isn't JSON data (a
 * function, a non-finite number, a Date or another class instance) throws a TypeError.
 */
export function canonicalJson(value: unknown): string {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) throw new TypeError(`Not JSON: the number ${value}`);
      return JSON.stringify(value);
    case "object": {
      if (value === null) return "null";
      if (Array.isArray(value)) return `[${value.map((item: unknown) => canonicalJson(item ?? null)).join(",")}]`;
      const proto = Object.getPrototypeOf(value) as unknown;
      if (proto !== Object.prototype && proto !== null) throw new TypeError("Not JSON: an object that isn't plain");
      const record = value as Record<string, unknown>;
      const fields = Object.keys(record)
        .filter((key) => record[key] !== undefined)
        .sort(compareText)
        .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
      return `{${fields.join(",")}}`;
    }
    default:
      throw new TypeError(`Not JSON: a value of type ${typeof value}`);
  }
}
