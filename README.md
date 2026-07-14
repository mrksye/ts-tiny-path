# ts-callable-path

A lightweight TypeScript routing library with **callable route objects** and automatic parameter completion.

> Formerly published as **`ts-tiny-path`** (now deprecated). Same API — just renamed to better reflect its callable-route design.

## Key Features

- 🚀 **Callable Routes** - No need for `.index()` or similar methods, routes are directly callable
- 🔧 **Auto-completion** - TypeScript automatically detects and completes required parameters
- 📦 **Lightweight** - Zero dependencies, minimal footprint
- 🌳 **Hierarchical** - Build nested route structures that mirror your app
- 🗂️ **Filesystem-style paths** - Absolute (`/users`) or relative (`edit`, `./edit`) segments; write a shared prefix once. `../` is intentionally rejected
- 🔒 **Type-safe** - Full TypeScript support with compile-time parameter validation

## Installation

```bash
npm install ts-callable-path
```

## Usage

### Basic Routes

```typescript
import { route } from 'ts-callable-path';

const userRoute = route('/users/:id');

// Callable - no .index() needed!
userRoute({ id: 123 }); // '/users/123'

// TypeScript auto-completion for parameters
userRoute({ id: 123, name: 'John' }); // Error: 'name' doesn't exist
userRoute({ }); // Error: 'id' is required

// Get raw template
userRoute.raw(); // '/users/:id'
```

### Hierarchical Routes

you can define routes:

```typescript
const routes = route('/', {
  user: route('/users/:id', {
    list: route('/users'),
    edit: route('/users/:id/edit'),
    post: route('/users/:userId/posts/:postId', {
      list: route('/users/:userId/posts')
    })
  }),
  api: route('/api', {
    v1: route('/api/v1', {
      user: route('/api/v1/users/:id', {
        list: route('/api/v1/users')
      })
    })
  })
});

// Direct callable usage - no method chaining needed
routes(); // '/'
routes.user({ id: 123 }); // '/users/123'
routes.user.list(); // '/users'
routes.user.post({userId: 1, postId: 123}); // '/users/1/posts/123'
routes.user.post.list({ userId: 1 }); // '/users/1/posts'

// TypeScript knows exactly what parameters each route needs
routes.api.v1.user({ id: 789 }); // ✅ 'id' auto-completed
routes.api.v1.user({ name: 'test' }); // ❌ Error: 'name' not expected
```

### Absolute vs. relative paths (filesystem-style)

Each segment is either **absolute** or **relative**, exactly like a filesystem path:

| Path | Meaning |
|---|---|
| `/users/:id` | **Absolute** — used as-is, ignores the parent. |
| `edit` | **Relative** — composed onto the parent (`parent + '/edit'`). |
| `./edit` | **Relative (explicit)** — same as `edit`; the `./` is just a readable marker. |
| `../x` | **Parent traversal** — rejected at compile time *and* runtime. |

Both styles coexist in one tree, chosen per node. Write full absolute paths where the
structure is irregular, and drop the shared prefix where it isn't:

```typescript
const api = route('/api/v1', {
  users: route('users', {                 // relative -> /api/v1/users
    show: route(':id'),                   // relative -> /api/v1/users/:id
    edit: route('./:id/edit'),            // relative -> /api/v1/users/:id/edit
  }),
  health: route('/health'),               // absolute -> /health (resets the base)
});

api.users();               // '/api/v1/users'
api.users.show({ id: 7 }); // '/api/v1/users/7'   ← ':id' inherited from the composed path
api.users.edit({ id: 7 }); // '/api/v1/users/7/edit'
api.health();              // '/health'

api.users.show.raw();      // '/api/v1/users/:id'

// A relative child inherits every :param from its parents, enforced at compile time:
api.users.show();          // ❌ Error: 'id' is required

route('../escape');        // ❌ Error: parent traversal ".." is not allowed
```

> **Recommendation:** prefer **absolute** paths. Because each node's literal *is* its full path,
> hovering any `route('/api/v1/users/:id')` in your editor shows the complete URL at a glance —
> no mental composition needed. Reach for relative segments only to factor out a long shared prefix.

## Why ts-callable-path?

### ✅ With ts-callable-path (Callable)
```typescript
const userDetail = route('/users/:id');
userDetail({ id: 123 }); // Clean and direct
```

## API

### `route(path, children?)`

Creates a callable route object.

- `path` - URL pattern with optional parameters (`:param`). **Absolute** if it starts with `/`, otherwise **relative** (a leading `./` is allowed and stripped). Paths containing a `..` segment are rejected.
- `children` - Optional nested routes object. Relative children are composed onto this route's resolved path and inherit its `:params`; an absolute child resets the base.

### Route Object Methods

- **Callable** - `route(params?)` - Generate URL with parameters
- `raw()` - Get the raw path template

## TypeScript Support

Full TypeScript support with:
- Parameter type inference from path patterns
- Compile-time parameter validation  
- Auto-completion for nested route structures
- Type-safe parameter objects

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Released under the [MIT License](./LICENSE).