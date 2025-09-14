/**
 * Type-safe URL routing with nested structure
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


type Route<T extends string, Children = {}> = TypedRoute<T> & Children;

function route<T extends string>(path: T): Route<T>;
function route<T extends string, Children>(path: T, children: Children): Route<T, Children>;
function route<T extends string, Children = {}>(path: T, children?: Children): Route<T, Children> {
  const hasParams = path.includes(':');
  
  const fn = function(params?: ExtractParams<T>): string {
    if (hasParams && !params) {
      throw new Error(`Parameters required for route: ${path}`);
    }
    if (!params) return path;
    return Object.entries(params).reduce<string>(
      (url, [key, value]) => url.replace(`:${key}`, String(value)),
      path
    );
  };

  fn.raw = () => path;
  
  if (children) {
    Object.assign(fn, children);
  }
  
  return fn as Route<T, Children>;
}

export { route, type Route };