import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://jinwoojeo.ng",
  integrations: [
    mdx(),
    sitemap(),
    icon(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "aurora-x",
      wrap: true,
    },
  },
});
