export interface TrackStep {
  label: string;
  /** Route of an existing page; the build fails on a broken one. */
  to: string;
}

export interface Track {
  id: string;
  title: string;
  goal: string;
  steps: TrackStep[];
}

/** The goal tracks on the landing page. Steps are page titles in prerequisite order. */
export const tracks: Track[] = [
  {
    id: 'first-app-in-space',
    title: 'Hello world app',
    goal: 'Run hello world in a space, then add an app page that a capability gates.',
    steps: [
      { label: 'Quickstart', to: '/vector-apps/quickstart' },
      { label: 'Add an app page and a capability', to: '/vector-apps/recipes/add-page-and-capability' },
    ],
  },
  {
    id: 'build-definition',
    title: 'Build an app definition',
    goal: 'Write an app definition from a form or a working example.',
    steps: [
      { label: 'App definition', to: '/sdk/app-definition' },
      { label: 'Definition builder', to: '/sdk/builder' },
      { label: 'Example app definitions', to: '/sdk/examples' },
    ],
  },
  {
    id: 'gate-by-capability',
    title: 'Gate by capability',
    goal: 'Limit app pages, navigation and server routes to users who hold a capability.',
    steps: [
      { label: 'Quickstart', to: '/vector-apps/quickstart' },
      { label: 'Add an app page and a capability', to: '/vector-apps/recipes/add-page-and-capability' },
      { label: 'Gate an app page and an endpoint by capability', to: '/vector-apps/recipes/gate-by-capability' },
      { label: 'Filter navigation by capability', to: '/vector-apps/guides/filter-navigation-by-capability' },
    ],
  },
  {
    id: 'agent-actions',
    title: 'Expose agent actions',
    goal: 'Let the space agent call an action on your app page while the app page is open.',
    steps: [
      { label: 'Quickstart', to: '/vector-apps/quickstart' },
      { label: 'Expose agent actions on an app page', to: '/vector-apps/recipes/expose-agent-actions' },
    ],
  },
];
