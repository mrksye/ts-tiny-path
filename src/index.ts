/**
 * Type-safe URL routing with a callable, nested structure.
 *
 * Paths follow a filesystem-like convention:
 *   - `/users/:id`  absolute — used as-is, ignores the parent.
 *   - `edit` / `./edit`  relative — composed onto the parent path (`./` is just an explicit marker).
 *   - `../x`  parent traversal — NOT allowed (rejected at compile time and runtime).
 *
 * A relative child inherits its parent's `:params`; an absolute descendant resets the base.
 */

type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string | number } & ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
    ? { [K in Param]: string | number }
    : {};

type TypedRoute<T extends string> =
  keyof ExtractParams<T> extends never
    ? (() => T) & { raw(): T }
    : ((params: ExtractParams<T>) => string) & { raw(): T };

declare const __kids: unique symbol;

/** A callable route carrying its resolved template `T` and its (composed) children `C`. */
type Route<T extends string, C = {}> = TypedRoute<T> & C & { readonly [__kids]?: C };

/** The resolved path template of a route (via its `raw()` return type). */
type RawOf<R> = R extends { raw(): infer T extends string } ? T : never;
/** The children map carried by a route. */
type KidsOf<R> = R extends { readonly [__kids]?: infer C } ? C : {};

/** Strip an explicit relative marker (`./foo` -> `foo`, `.` -> ``). */
type StripDot<T extends string> = T extends `./${infer R}` ? R : T extends '.' ? '' : T;

/** Join a base path and a relative segment, normalizing the slash. */
type Join<Base extends string, Seg extends string> =
  Seg extends '' ? Base : Base extends '/' ? `/${Seg}` : `${Base}/${Seg}`;

/** Compose a route (and its whole subtree) onto `Base`. Absolute nodes keep their path and reset the base. */
type Prefix<Base extends string, R> =
  [RawOf<R>] extends [never]
    ? R
    : RawOf<R> extends `/${string}`
    ? R
    : Route<Join<Base, StripDot<RawOf<R> & string>>, { [K in keyof KidsOf<R>]: Prefix<Base, KidsOf<R>[K]> }>;

/** True when the path contains a `..` segment (parent traversal). */
type HasParentTraversal<T extends string> =
  T extends '..'
    ? true
    : T extends `../${string}`
    ? true
    : T extends `${string}/../${string}`
    ? true
    : T extends `${string}/..`
    ? true
    : false;

/** Reject `..` paths at the call site with a readable message. */
type NoDotDot<T extends string> = HasParentTraversal<T> extends true
  ? { __error: 'parent traversal ".." is not allowed'; path: T }
  : T;

const segment = Symbol('segment');
const parent = Symbol('parent');

/** Internal shape of a constructed route node (the callable plus its hidden segment/parent links). */
type RouteNode = {
  (params?: Record<string, string | number>): string;
  raw(): string;
  [segment]: string;
  [parent]: RouteNode | undefined;
};

const isParentTraversal = (path: string): boolean => /(^|\/)\.\.(\/|$)/.test(path);

/** Drop a leading `./` (or a lone `.`) from a relative segment. */
const stripDot = (seg: string): string => (seg === '.' ? '' : seg.startsWith('./') ? seg.slice(2) : seg);

const joinPath = (base: string, seg: string): string =>
  seg === '' ? base : (base === '/' ? '' : base.replace(/\/+$/, '')) + '/' + seg;

/** Resolve a node's full path by walking up to the nearest absolute ancestor. */
const resolve = (node: RouteNode): string => {
  const seg = node[segment];
  if (seg.charAt(0) === '/') return seg;
  const base = node[parent];
  if (!base) return seg;
  return joinPath(resolve(base), stripDot(seg));
};

function route<T extends string>(path: T & NoDotDot<T>): Route<T>;
function route<T extends string, C>(path: T & NoDotDot<T>, children: C): Route<T, { [K in keyof C]: Prefix<T, C[K]> }>;
function route(path: string, children?: Record<string, unknown>): unknown {
  if (isParentTraversal(path)) {
    throw new Error(`parent traversal ".." is not allowed: ${path}`);
  }

  const fn = function (params?: Record<string, string | number>): string {
    const resolved = resolve(fn);
    if (resolved.includes(':') && !params) {
      throw new Error(`Parameters required for route: ${resolved}`);
    }
    if (!params) return resolved;
    return Object.entries(params).reduce<string>((url, [key, value]) => url.replace(`:${key}`, String(value)), resolved);
  } as RouteNode;

  Object.defineProperty(fn, segment, { value: path });
  Object.defineProperty(fn, parent, { value: undefined, writable: true });
  fn.raw = () => resolve(fn);

  if (children) {
    for (const key of Object.keys(children)) {
      const child = children[key] as RouteNode;
      child[parent] = fn;
      (fn as unknown as Record<string, unknown>)[key] = child;
    }
  }

  return fn;
}

export { route, type Route };
