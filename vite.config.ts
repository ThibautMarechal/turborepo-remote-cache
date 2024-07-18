import { unstable_vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import 'dotenv/config';

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ['**/.*'],
      serverModuleFormat: 'esm',
    }),
    tsconfigPaths(),
  ],

  server: {
    port: Number(process.env.PORT ?? 3000),
    https:
      process.env.HTTPS === 'true'
        ? {
            key: process.env.HTTPS_KEY,
            cert: process.env.HTTPS_CERT,
          }
        : undefined,
  },
});
