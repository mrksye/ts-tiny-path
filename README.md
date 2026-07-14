# ts-callable-path

A lightweight TypeScript routing library with **callable route objects** and automatic parameter completion.

> Formerly published as **`ts-tiny-path`** (now deprecated). Same API — just renamed to better reflect its callable-route design.

## Key Features

- 🚀 **Callable Routes** - No need for `.index()` or similar methods, routes are directly callable
- 🔧 **Auto-completion** - TypeScript automatically detects and completes required parameters
- 📦 **Lightweight** - Zero dependencies, minimal footprint
- 🌳 **Hierarchical** - Build nested route structures that mirror your app
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

also you can define:

```typescript
const home = route('/', {
  users: route('/users', {
    show: route('/users/:id'),
    edit: route('/users/:id/edit'),
    posts: route('/users/:id/posts', {
      show: route('/users/:userId/posts/:postId')
    })
  }),
  api: route('/api', {
    v1: route('/api/v1', {
      users: route('/api/v1/users', {
        user: route('/api/v1/users/:id')
      })
    })
  })
});

// Direct callable usage - no method chaining needed
home(); // '/'
home.users(); // '/users'
home.users.show({ id: 123 }); // '/users/123'
home.users.edit({ id: 123 }); // '/users/123/edit'
home.users.posts.show({ userId: 1, postId: 456 }); // '/users/1/posts/456'

// TypeScript knows exactly what parameters each route needs
home.api.v1.users.user({ id: 789 }); // ✅ 'id' auto-completed
home.api.v1.users.user({ name: 'test' }); // ❌ Error: 'name' not expected
```

## Why ts-callable-path?

### ✅ With ts-callable-path (Callable)
```typescript
const userDetail = route('/users/:id');
userDetail({ id: 123 }); // Clean and direct
```

## API

### `route(path, children?)`

Creates a callable route object.

- `path` - URL pattern with optional parameters (`:param`)
- `children` - Optional nested routes object

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