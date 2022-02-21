/**
 * Everything in this file is, in principle, strippable.
 */

/**
 * The strippable usage pattern is:
 *
 * ```ts
 * let name = QualifiedName("xlink:actuate");
 * console.log(Wrapper.getInner(name));
 * ```
 *
 * which is stripped to:
 *
 * ```ts
 * let name = "xlink:actuate";
 * console.log(name);
 * ```
 *
 * If you want to run code that is explicitly for debug-mode only, then you can
 * use this usage pattern:
 *
 * ```ts
 * let person = Wrapper.withMeta({ name: "Tom" }, { description: "Person" });
 * Wrapper.inDebug(person, (person, meta) => {
 *   console.group(meta.description);
 *   console.log(`%cName:%c ${person.name}`, "color: red", "color: black");
 *   console.groupEnd();
 * })
 * ```
 *
 * Which gets stripped to:
 *
 * ```ts
 * let person = { name: "Tom" };
 * ```
 */
export class Wrapper<T, Meta, S extends symbol> {
  static of<T, S extends symbol>(value: T, symbol: S): Wrapper<T, null, S> {
    return new Wrapper(null, symbol, value);
  }

  static withMeta<T, S extends symbol, Meta>(
    value: T,
    meta: Meta,
    symbol: S
  ): Wrapper<T, Meta, S> {
    return new Wrapper(meta, symbol, value);
  }

  /**
   * @strip.value newtype
   */
  static getInner<T>(newtype: AnyWrapper<T>): T {
    return newtype.#inner;
  }

  /**
   * @strip.noop
   */
  static inDebug<T, Meta>(
    newtype: AnyWrapper<T, Meta>,
    callback: (value: T, meta: Meta) => void
  ): void {
    callback(newtype.#inner, newtype.#debugMeta);
  }

  #debugMeta: Meta;
  // Unused field for nominal typing
  #symbol: S;
  #inner: T;

  private constructor(debugMeta: Meta, symbol: S, inner: T) {
    this.#debugMeta = debugMeta;
    this.#symbol = symbol;
    this.#inner = inner;
  }
}

/**
 * Use this type to force TypeScript to accept the inferred function body's
 * return type as compatible with the function's signature.
 *
 * In general, this is necessary when the signature uses generics and mapped
 * types, but the function body uses `unknown` (because the generics are not
 * reified as a runtime concept in TypeScript).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferReturn = any;

/**
 * Use this type to force TypeScript to accept an argument as compatible with
 * the function's signature. return type as compatible with the signature of a
 * function it is used inside of.
 *
 * In general, this is necessary when the signature uses generics and mapped
 * types, but the function body uses `unknown` (because the generics are not
 * reified as a runtime concept in TypeScript).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferArgument = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnsafeAny = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyKey = keyof any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SymbolKey = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyIndex = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyIndexValue = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Metaprogramming = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord<V = any> = { [P in keyof any]: V };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDict = { [P in keyof any as Extract<P, string>]: any };

export type AnyWrapper<T, Meta = unknown> = Wrapper<T, Meta, UnsafeAny>;

export interface OpaqueMetadata {
  description: string;
}

/**
 * An opaque alias is a simple wrapper around a value that exists (in this
 * codebase) purely to distinguish different variants of the same underlying
 * type (like localName vs. qualifiedName).
 */
export type OpaqueAlias<T, S extends symbol> = Wrapper<T, OpaqueMetadata, S>;

export type OpaqueValue<O extends OpaqueAlias<unknown, symbol>> =
  O extends OpaqueAlias<infer T, symbol> ? T : never;

const QUALIFIED_NAME = Symbol("QUALIFIED_NAME");

export type QualifiedName = OpaqueAlias<string, typeof QUALIFIED_NAME>;

/**
 * @strip.value name
 */
export function QualifiedName(name: string): QualifiedName {
  return Wrapper.withMeta(
    name,
    { description: "QualifiedName" },
    QUALIFIED_NAME
  );
}

const LOCAL_NAME = Symbol("LOCAL_NAME");

export type LocalName = OpaqueAlias<string, typeof LOCAL_NAME>;

/**
 * @strip.value name
 */
export function LocalName(name: string): LocalName {
  return Wrapper.withMeta(name, { description: "LocalName" }, LOCAL_NAME);
}