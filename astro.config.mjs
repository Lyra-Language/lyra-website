// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import rehypeTreeSitter from "rehype-tree-sitter";

// Workspace root (parent of lyra-website/), resolved relative to this config
// file so the build is portable across machines and independent of cwd.
const treeSitterGrammarRoot = fileURLToPath(new URL("..", import.meta.url));

// Hands rehype-tree-sitter only the `lyra` blocks. It highlights every fenced block with a
// language, and throws for one whose grammar is not beside the site — and Astro reports
// that and still ships the page, empty. A ```bash fence emptied Getting Started that way.
// Clearing the language off any other block leaves it as plain, unhighlighted code.
const onlyLyraIsHighlighted = () => (tree) => {
  const walk = (node) => {
    const classes = node.tagName === "code" ? node.properties?.className : undefined;
    if (Array.isArray(classes) && !classes.includes("language-lyra")) node.properties = {};
    node.children?.forEach(walk);
  };
  walk(tree);
};

// https://astro.build/config
export default defineConfig({
  // The deployed address (Cloudflare Worker `lyra-website`; see wrangler.jsonc). Astro
  // writes it into the sitemap and canonical links, so change it with the domain.
  site: "https://lyra-website.avrameisner.workers.dev",
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      onlyLyraIsHighlighted,
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
