import { defineCollection } from "astro:content";
import type { Loader } from "astro/loaders";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { blogSchema } from "starlight-blog/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoaderFailingOnErrors(),
    schema: docsSchema({
      extend: (context) => blogSchema(context),
    }),
  }),
};

/**
 * Starlight's docs loader, made to fail a build when a page cannot be read or rendered.
 *
 * Astro's glob loader catches those errors, logs them, and stores the page with no
 * content — and the build still succeeds. That is how Getting Started went live empty:
 * a ```bash fence made the highlighter throw (see CLAUDE.md, Lyra code highlighting).
 * Every error the loader logs is collected here and, in a build, thrown once the
 * collection has loaded, naming each page.
 *
 * `astro dev` keeps the log line and the empty page, so one broken page does not stop
 * the rest from serving. Only dev has a file watcher, which is how the two are told
 * apart.
 */
function docsLoaderFailingOnErrors(): Loader {
  const loader = docsLoader();
  return {
    ...loader,
    load: async (context) => {
      const errors: string[] = [];
      const logger = Object.create(context.logger);
      logger.error = (message: string) => {
        errors.push(message);
        context.logger.error(message);
      };

      await loader.load({ ...context, logger });

      if (errors.length > 0 && context.watcher === undefined) {
        throw new Error(
          `${errors.length} docs page(s) failed to load, and would ship empty:\n` +
            errors.map((e) => `  ${e}`).join("\n")
        );
      }
    },
  };
}
