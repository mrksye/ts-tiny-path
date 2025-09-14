# tiny-path

A lightweight TypeScript routing library with **callable route objects** and automatic parameter completion.

## Key Features

- 🚀 **Callable Routes** - No need for `.index()` or similar methods, routes are directly callable
- 🔧 **Auto-completion** - TypeScript automatically detects and completes required parameters
- 📦 **Lightweight** - Zero dependencies, minimal footprint
- 🌳 **Hierarchical** - Build nested route structures that mirror your app
- 🔒 **Type-safe** - Full TypeScript support with compile-time parameter validation

## Installation

```bash
npm install tiny-path
```

## Usage

### Basic Routes

```typescript
import { route } from 'tiny-path';

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

```typescript
const routes = route('/', {
  users: route('/users', {
    detail: route('/users/:id'),
    edit: route('/users/:id/edit'),
    posts: route('/users/:id/posts', {
      detail: route('/users/:userId/posts/:postId')
    })
  }),
  api: route('/api', {
    v1: route('/api/v1', {
      users: route('/api/v1/users/:id')
    })
  })
});

// Direct callable usage - no method chaining needed
routes(); // '/'
routes.users(); // '/users'
routes.users.detail({ id: 123 }); // '/users/123'
routes.users.posts.detail({ userId: 1, postId: 456 }); // '/users/1/posts/456'

// TypeScript knows exactly what parameters each route needs
routes.api.v1.users({ id: 789 }); // ✅ 'id' auto-completed
routes.api.v1.users({ name: 'test' }); // ❌ Error: 'name' not expected
```

## Why tiny-path?

### ✅ With tiny-path (Callable)
```typescript
const userDetail = route('/users/:id');
userDetail({ id: 123 }); // Clean and direct
```

### ❌ Traditional routing libraries
```typescript
// Most libraries require method calls
userDetail.build({ id: 123 });
userDetail.generate({ id: 123 });
userDetail.index({ id: 123 });
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

## License

MIT