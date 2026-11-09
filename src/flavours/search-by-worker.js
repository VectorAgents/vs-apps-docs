import siteConfig from '@generated/docusaurus.config';
import { fetchIndexesByWorker, searchByWorker as search } from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/searchByWorker';
import { processTreeStatusOfSearchResults } from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/processTreeStatusOfSearchResults';
import { rankByFlavour } from './search.mjs';
import { readShown } from './useFlavours';

const site = siteConfig.customFields.flavourSite;

export { fetchIndexesByWorker };

/** Stands in for the module of the same name in the search plugin: its results, with the hits of the reader's flavour first. */
export async function searchByWorker(baseUrl, searchContext, input, limit) {
  const results = await search(baseUrl, searchContext, input, limit);
  return rankByFlavour(results, site, { ...site.defaults, ...readShown(site) }, processTreeStatusOfSearchResults);
}
