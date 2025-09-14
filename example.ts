/**
 * Usage example showing hierarchical route structure
 */
import { route } from './src/index';

// Define hierarchical routes with type-safe structure
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

// Usage examples - hierarchical structure is visible at type level
console.log(routes()); // '/'
console.log(routes.users()); // '/users' 
console.log(routes.users.detail({ id: 123 })); // '/users/123'
console.log(routes.users.posts.detail({ userId: 1, postId: 456 })); // '/users/1/posts/456'
console.log(routes.api.v1.users({ id: 789 })); // '/api/v1/users/789'

// Raw path templates
console.log(routes.users.detail.raw()); // '/users/:id'
console.log(routes.api.v1.posts.raw()); // '/api/v1/posts/:slug'


export { routes };