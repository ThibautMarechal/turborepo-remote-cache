/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['.*'],
  devServerPort: 3000,
  tailwind: true,
  future: {
    v2_meta: true,
    v2_errorBoundary: true,
    unstable_tailwind: true,
  },
};
