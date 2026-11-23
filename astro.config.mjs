import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/dev/') })],
});
