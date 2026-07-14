/**
 * Usage example showing hierarchical route structure.
 */
import { route } from './src/index';

// Recommended: absolute paths. Each node's literal IS its full path, so hovering any
// route in your editor shows the complete URL — no mental composition needed.
const routes = route('/', {
  users: route('/users', {
    detail: route('/users/:id'),
    edit: route('/users/:id/edit'),
    posts: route('/users/:id/posts', {
      detail: route('/users/:userId/posts/:postId')
    })
  }),
  posts: route('/posts', {
    detail: route('/posts/:id'),
    create: route('/posts/create')
  }),
  api: route('/api', {
    v1: route('/api/v1', {
      users: route('/api/v1/users/:id'),
      posts: route('/api/v1/posts/:slug')
    })
  })
});

console.log(routes()); // '/'
console.log(routes.users()); // '/users'
console.log(routes.users.detail({ id: 123 })); // '/users/123'
console.log(routes.users.posts.detail({ userId: 1, postId: 456 })); // '/users/1/posts/456'
console.log(routes.api.v1.users({ id: 789 })); // '/api/v1/users/789'
console.log(routes.users.detail.raw()); // '/users/:id'

// Optional: relative segments (filesystem-style) let you factor out a shared prefix.
// A leading '/' is absolute; no slash (or './') is relative and inherits parent params.
// '../' is rejected.
const api = route('/api/v1', {
  users: route('users', {          // -> /api/v1/users
    show: route(':id'),            // -> /api/v1/users/:id
    edit: route('./:id/edit')      // -> /api/v1/users/:id/edit
  }),
  health: route('/health')         // absolute -> /health (resets the base)
});

console.log(api.users());                // '/api/v1/users'
console.log(api.users.show({ id: 7 }));  // '/api/v1/users/7'
console.log(api.users.edit({ id: 7 }));  // '/api/v1/users/7/edit'
console.log(api.health());               // '/health'
console.log(api.users.show.raw());       // '/api/v1/users/:id'

export { routes, api };
