import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  vectorSpace: ['vector-space/glossary'],
  vectorApps: [
    'vector-apps/quickstart',
    {
      type: 'category',
      label: 'Recipes',
      link: {
        type: 'generated-index',
        slug: '/vector-apps/category/recipes',
        description: 'Step-by-step tasks that add one feature to the example app, from simplest to most advanced.',
      },
      items: [
        'vector-apps/recipes/add-page-and-capability',
        'vector-apps/recipes/gate-by-capability',
        'vector-apps/recipes/read-app-context',
        'vector-apps/recipes/list-members',
        'vector-apps/recipes/expose-agent-actions',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      link: {
        type: 'generated-index',
        slug: '/vector-apps/category/guides',
        description: 'Advanced configuration of an app, one topic per guide.',
      },
      items: [
        'vector-apps/guides/agent-action-trees',
        'vector-apps/guides/filter-navigation-by-capability',
        'vector-apps/guides/call-space-from-your-server',
        'vector-apps/guides/call-a-model-from-your-server',
        'vector-apps/guides/expose-app-as-a2a-agent',
        'vector-apps/guides/open-route-and-read-caller',
        'vector-apps/guides/handle-connector-events',
      ],
    },
    'vector-apps/glossary',
  ],
  sdk: [
    'sdk/app-definition',
    { type: 'link', label: 'Definition builder', href: '/sdk/builder' },
    'sdk/examples',
    {
      type: 'category',
      label: 'Reference',
      link: {
        type: 'generated-index',
        slug: '/sdk/category/reference',
        description: 'Signatures and behaviour of each export in @vectoragents/vs-apps.',
      },
      items: [
        'sdk/reference/root',
        'sdk/reference/server',
        'sdk/reference/browser',
        'sdk/reference/react',
        'sdk/reference/harness',
        'sdk/reference/orpc',
        'sdk/reference/extract',
        'sdk/reference/conformance',
      ],
    },
    'sdk/glossary',
  ],
};

export default sidebars;
