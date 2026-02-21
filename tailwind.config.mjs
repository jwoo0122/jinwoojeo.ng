import tailwindTypo from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      mono: ['monospace', 'monospace']
    },
    extend: {},
  },
  plugins: [tailwindTypo],
};
