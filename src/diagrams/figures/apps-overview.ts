import type { StructureData } from '../figure/types.ts';

/** The overview of `how-a-vector-app-works`. */
export const appsOverview: StructureData = {
  id: 'apps-overview',
  title: 'How a Vector App fits in a space',
  desc: 'Two slabs side by side. The Vector Space slab holds your client, the AI gateway and platform data. The Your origin slab holds your server and the manifest. Dashed lines join your client to your server, your server to platform data, and Vector Space to the manifest.',
  caption: 'How a Vector App fits in a space',
  slabs: [
    { id: 'space', label: 'Vector Space', text: 'Hosts your app and shows each app page in an iframe.', level: 0, c: 0, r: 0, w: 10.6, d: 10.2 },
    { id: 'origin', label: 'Your origin', text: 'Where your app runs. You deploy and own it.', level: 0, c: 13.4, r: 0, w: 5.2, d: 10.2 },
  ],
  parts: [
    { id: 'client', label: 'Your client', text: 'Runs in an iframe and shows your app pages. Vector Space gives it a user token.', icon: 'app', tone: 'plug', on: 'space', c: 6, r: 1.6, w: 3.2, d: 2.8 },
    { id: 'gateway', label: 'AI gateway', text: "Every model call goes through it, on the organization's own AI provider accounts.", icon: 'gateway', tone: 'core', on: 'space', c: 1.6, r: 5.8, w: 3.2, d: 2.8 },
    { id: 'data', label: 'Platform data', text: 'The members and resources of the space that your app may read. Your server reads them with an app token.', icon: 'contextHub', tone: 'core', on: 'space', c: 6, r: 5.8, w: 3.2, d: 2.8 },
    { id: 'server', label: 'Your server', text: 'Checks each token, serves your endpoints and serves the manifest. Your client calls it with the user token.', icon: 'mcp', tone: 'plug', on: 'origin', c: 14.4, r: 1.6, w: 3.2, d: 2.8 },
    { id: 'manifest', label: 'Manifest', text: 'JSON that your server serves. Vector Space reads it with a provisioning token to register the app.', icon: 'audit', tone: 'plug', on: 'origin', c: 14.4, r: 5.8, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'client-server', from: 'client', to: 'server', remote: true },
    { id: 'server-data', from: 'server', to: 'data', remote: true },
    { id: 'space-manifest', from: 'space', to: 'manifest', remote: true },
  ],
  legend: [
    { swatch: 'core', text: 'Vector Space supplies it' },
    { swatch: 'plug', text: 'You write it' },
    { swatch: 'remote', text: 'Dashed line: a call between Vector Space and your origin' },
  ],
};
