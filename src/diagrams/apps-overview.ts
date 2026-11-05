import type { IsoDiagramData } from './isoLayout.ts';

/** Slab top, the height at which parts stand and token-path lines run. */
const TOP = 5;

export const appsOverview: IsoDiagramData = {
  title: 'How a Vector App fits in a space',
  desc: 'Vector Space embeds your client in an iframe and gives it a user token. Your client calls your server with that token. Your server calls Vector Space with an app token. Vector Space reads your manifest from your server with a provisioning token.',
  caption: 'How a Vector App fits in a space',
  legendTitles: { places: 'Places', parts: 'Parts', links: 'Token path' },
  slabs: [
    { id: 'space', label: 'Vector Space', text: 'Hosts your app and embeds each app page in an iframe.', tone: 'slab', c: 0, r: 0, w: 9, d: 8, h: TOP, z: 0 },
    { id: 'origin', label: 'Your origin', text: 'Where your app runs. You deploy and own it.', tone: 'slab', c: 12, r: 0, w: 7, d: 8, h: TOP, z: 0 },
  ],
  parts: [
    { id: 'client', badge: 1, label: 'Your client', text: 'Runs in the iframe and shows your app pages.', tone: 'plug', c: 1.5, r: 0.9, w: 4, d: 0.8, h: 18, z: TOP },
    { id: 'server', badge: 2, label: 'Your server', text: 'Checks tokens, serves your endpoints and the manifest.', tone: 'plug', c: 13.5, r: 0.8, w: 3, d: 3.8, h: 20, z: TOP },
    { id: 'manifest', badge: 3, label: 'Manifest', text: 'JSON that your server serves. Vector Space reads it to register the app.', tone: 'plug', c: 13.5, r: 5.6, w: 1.8, d: 1.6, h: 8, z: TOP },
    { id: 'data', badge: 4, label: 'Platform data', text: 'Members and resources of the space that your app may read.', tone: 'core', c: 1.2, r: 3.4, w: 2.2, d: 2.2, h: 8, z: TOP },
    { id: 'gateway', badge: 5, label: 'AI gateway', text: "Every model call goes through it, on the organization's own provider accounts.", tone: 'core', c: 5.2, r: 3.4, w: 2.2, d: 2.2, h: 8, z: TOP },
  ],
  links: [
    { id: 'a', badge: 'a', text: 'Vector Space sends your client a user token.', from: [4.3, 5], to: [4.3, 1.8], z: TOP },
    { id: 'b', badge: 'b', text: 'Your client calls your server with the user token.', from: [5.7, 1.3], to: [13.3, 1.3], z: TOP },
    { id: 'c', badge: 'c', text: 'Your server calls Vector Space with an app token, to read data and call models.', from: [13.3, 4], to: [8, 4], z: TOP },
    { id: 'd', badge: 'd', text: 'Vector Space reads your manifest with a provisioning token.', from: [8, 6.4], to: [13.3, 6.4], z: TOP },
  ],
};
