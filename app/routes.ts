import { route, type RouteConfig } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';

const CLEAN_PATHS = ['artifacts/clean', 'profile/artifacts/clean', 'users/:username/artifacts/clean', 'teams/:teamSlug/artifacts/clean'];

export default [
  ...(await flatRoutes()),
  // Same "clean artifacts" page for every scope, see app/clean/route.tsx
  ...CLEAN_PATHS.map((path) => route(path, 'clean/route.tsx', { id: `clean:${path}` })),
] satisfies RouteConfig;
