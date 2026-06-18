// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import rehypeTreeSitter from "rehype-tree-sitter";

// https://astro.build/config
export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeTreeSitter,
        {
          treeSitterGrammarRoot: "/Users/avrameisner/Dev/lyra",
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
      title: "Lyra",
      customCss: ["./src/styles/custom.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
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
