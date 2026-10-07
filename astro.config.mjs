// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import rehypeTreeSitter from "rehype-tree-sitter";

// Workspace root (parent of lyra-website/), resolved relative to this config
// file so the build is portable across machines and independent of cwd.
const treeSitterGrammarRoot = fileURLToPath(new URL("..", import.meta.url));

// https://astro.build/config
export default defineConfig({
  // The deployed address: Cloudflare Pages, project `lyra-website`. Astro writes it into
  // the sitemap and canonical links, so change it with the domain.
  site: "https://lyra-website.pages.dev",
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeTreeSitter,
        {
          treeSitterGrammarRoot,
          scopeMap: {
            lyra: "source.lyra_parser",
          },
        },
      ],
    ],
  },
  integrations: [
    starlight({
      plugins: [starlightBlog()],
      expressiveCode: false,
      title: "Lyra",
      // Brand theme first, syntax theme second: night-owl-theme.css styles the
      // insides of code blocks and must win where the two ever touch.
      customCss: [
        "./src/styles/lyra-brand.css",
        "./src/styles/night-owl-theme.css",
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Lyra-Language/lyra",
        },
      ],
      sidebar: [
        {
          // A track, read in order: each page builds on the one before it.
          label: "Learn Lyra",
          items: [
            { label: "Getting Started", slug: "learn/getting-started" },
            { label: "Values and Bindings", slug: "learn/basics" },
            { label: "Functions", slug: "learn/functions" },
            { label: "Control Flow", slug: "learn/control-flow" },
            { label: "Structs and Data Types", slug: "learn/structs" },
            { label: "Maybe and Result", slug: "learn/errors" },
            { label: "Traits and Generics", slug: "learn/traits" },
            { label: "Effects", slug: "learn/effects" },
            { label: "Modules", slug: "learn/modules" },
            { label: "Cheat Sheet", slug: "learn/cheat-sheet" },
          ],
        },
        {
          label: "Guides",
          items: [
            {
              label: "Types",
              items: [
                { label: "Primitives", slug: "guides/types/primitives" },
                { label: "Tuples", slug: "guides/types/tuples" },
                { label: "Arrays", slug: "guides/types/arrays" },
                { label: "Data", slug: "guides/types/data" },
                { label: "Newtypes", slug: "guides/types/newtypes" },
              ],
            },
            { label: "Regular Expressions", slug: "guides/regex" },
            { label: "Sequences", slug: "guides/sequences" },
            { label: "Command-Line Programs", slug: "guides/cli" },
          ],
        },
        {
          label: "Reference",
          items: [{ autogenerate: { directory: "reference" } }],
        },
      ],
    }),
  ],
});
