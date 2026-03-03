import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://jinwoojeo.ng",

  integrations: [
    mdx(),
    sitemap(),
    icon(),
  ],

  markdown: {
    shikiConfig: {
      theme: "aurora-x",
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss({
    })],
  },
});
