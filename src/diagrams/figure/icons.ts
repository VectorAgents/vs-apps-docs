/** One SVG element of an icon: its tag and attributes. */
export type IconElement = readonly [tag: 'path' | 'circle' | 'rect' | 'ellipse' | 'polyline', attributes: Readonly<Record<string, string>>];

/**
 * Icons of the Vector Space client, on a 24 by 24 grid, drawn with a 2 unit round stroke. The shapes are Lucide icons
 * (ISC licence): `User`, `UserCog`, `Bot`, `Inbox`, `Database`, `LayoutGrid`, `Globe`, `Cpu`, `Workflow`, `ContactRound`, `Plug`,
 * `ShieldCheck`, `KeyRound`, `Timer`, `Play`, `LayoutDashboard`, `HeartPulse`, `Activity` and `ScrollText`, plus `Search`
 * for the Omnibox and `Shield` for the AI gateway.
 */
export const ICONS = {
  member: [['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }], ['circle', { cx: '12', cy: '7', r: '4' }]],
  orchestrator: [['path', { d: 'M12 8V4H8' }], ['rect', { width: '16', height: '12', x: '4', y: '8', rx: '2' }], ['path', { d: 'M2 14h2' }], ['path', { d: 'M20 14h2' }], ['path', { d: 'M15 13v2' }], ['path', { d: 'M9 13v2' }]],
  commandCenter: [['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }], ['path', { d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }]],
  contextHub: [['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }], ['path', { d: 'M3 5V19A9 3 0 0 0 21 19V5' }], ['path', { d: 'M3 12A9 3 0 0 0 21 12' }]],
  modules: [['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1' }], ['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1' }], ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }], ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1' }]],
  a2a: [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }], ['path', { d: 'M2 12h20' }]],
  mcp: [['path', { d: 'M12 20v2' }], ['path', { d: 'M12 2v2' }], ['path', { d: 'M17 20v2' }], ['path', { d: 'M17 2v2' }], ['path', { d: 'M2 12h2' }], ['path', { d: 'M2 17h2' }], ['path', { d: 'M2 7h2' }], ['path', { d: 'M20 12h2' }], ['path', { d: 'M20 17h2' }], ['path', { d: 'M20 7h2' }], ['path', { d: 'M7 20v2' }], ['path', { d: 'M7 2v2' }], ['rect', { x: '4', y: '4', width: '16', height: '16', rx: '2' }], ['rect', { x: '8', y: '8', width: '8', height: '8', rx: '1' }]],
  app: [['rect', { width: '8', height: '8', x: '3', y: '3', rx: '2' }], ['path', { d: 'M7 11v4a2 2 0 0 0 2 2h4' }], ['rect', { width: '8', height: '8', x: '13', y: '13', rx: '2' }]],
  contacts: [['path', { d: 'M16 2v2' }], ['path', { d: 'M17.915 22a6 6 0 0 0-12 0' }], ['path', { d: 'M8 2v2' }], ['circle', { cx: '12', cy: '12', r: '4' }], ['rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }]],
  omnibox: [['circle', { cx: '11', cy: '11', r: '8' }], ['path', { d: 'm21 21-4.3-4.3' }]],
  gateway: [['path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }]],
  connector: [['path', { d: 'M12 22v-5' }], ['path', { d: 'M15 8V2' }], ['path', { d: 'M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z' }], ['path', { d: 'M9 8V2' }]],
  admin: [['path', { d: 'M10 15H6a4 4 0 0 0-4 4v2' }], ['path', { d: 'm14.305 16.53.923-.382' }], ['path', { d: 'm15.228 13.852-.923-.383' }], ['path', { d: 'm16.852 12.228-.383-.923' }], ['path', { d: 'm16.852 17.772-.383.924' }], ['path', { d: 'm19.148 12.228.383-.923' }], ['path', { d: 'm19.53 18.696-.382-.924' }], ['path', { d: 'm20.772 13.852.924-.383' }], ['path', { d: 'm20.772 16.148.924.383' }], ['circle', { cx: '18', cy: '15', r: '3' }], ['circle', { cx: '9', cy: '7', r: '4' }]],
  accessCheck: [['path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }], ['path', { d: 'm9 12 2 2 4-4' }]],
  serviceAccount: [['path', { d: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z' }], ['circle', { cx: '16.5', cy: '7.5', r: '.5' }]],
  helper: [['path', { d: 'M10 2h4' }], ['path', { d: 'm12 14 3-3' }], ['circle', { cx: '12', cy: '14', r: '8' }]],
  execution: [['path', { d: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z' }]],
  overview: [['rect', { width: '7', height: '9', x: '3', y: '3', rx: '1' }], ['rect', { width: '7', height: '5', x: '14', y: '3', rx: '1' }], ['rect', { width: '7', height: '9', x: '14', y: '12', rx: '1' }], ['rect', { width: '7', height: '5', x: '3', y: '16', rx: '1' }]],
  health: [['path', { d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5' }], ['path', { d: 'M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27' }]],
  activity: [['path', { d: 'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2' }]],
  audit: [['path', { d: 'M15 12h-5' }], ['path', { d: 'M15 8h-5' }], ['path', { d: 'M19 17V5a2 2 0 0 0-2-2H4' }], ['path', { d: 'M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3' }]],
} as const satisfies Record<string, readonly IconElement[]>;

export type IconName = keyof typeof ICONS;
