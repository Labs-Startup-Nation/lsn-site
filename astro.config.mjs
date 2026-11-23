import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { assertDeployEnv } from './scripts/deploy-env.mjs';

assertDeployEnv(process.env);

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'ignore',
  // Inline CSS: no render-blocking stylesheet request before the first paint.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/dev/') })],
});
