import { fileURLToPath } from 'node:url';

const replacement = fileURLToPath(new URL('../flavours/search-by-worker.js', import.meta.url));
const pluginComponent = /docusaurus-search-local[\\/]dist[\\/]client[\\/]client[\\/]theme[\\/]Search(Bar|Page)$/;

/**
 * Swaps the `../searchByWorker` import of the search plugin's search bar and results page for
 * `src/flavours/search-by-worker.js`, the one place where both ask for hits. The plugin has no option to rank or flag
 * a hit. `scripts/flavour-search.test.mjs` fails when a plugin upgrade moves that import.
 */
export default function flavourSearch() {
  return {
    name: 'flavour-search',
    configureWebpack(_config, _isServer, { currentBundler }) {
      return {
        plugins: [
          new currentBundler.instance.NormalModuleReplacementPlugin(/^\.\.\/searchByWorker$/, (resource) => {
            if (pluginComponent.test(resource.context)) resource.request = replacement;
          }),
        ],
      };
    },
  };
}
