// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pitycalc.top',
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
