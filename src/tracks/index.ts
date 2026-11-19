export interface Track {
  id: string;
  title: string;
  goal: string;
  /** Route of the first page of the goal; the build fails on a broken one. */
  to: string;
}

/** The goals in the Build card of the entry page. */
export const tracks: Track[] = [
  {
    id: 'first-app-in-space',
    title: 'Hello world app',
    goal: 'Run hello world in a space, then add an app page that a permission gates.',
    to: '/vector-apps/quickstart',
  },
  {
    id: 'build-definition',
    title: 'Build an app definition',
    goal: 'Write an app definition from a form or a working example.',
    to: '/sdk/app-definition',
  },
  {
    id: 'gate-by-permission',
    title: 'Gate by permission',
    goal: 'Limit app pages, navigation and server routes to members who hold a permission.',
    to: '/vector-apps/quickstart',
  },
  {
    id: 'agent-actions',
    title: 'Expose agent actions',
    goal: 'Let the space agent call an action on your app page while the app page is open.',
    to: '/vector-apps/quickstart',
  },
];
