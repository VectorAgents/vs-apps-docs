/** One SVG element of an icon: its tag and attributes. */
export type IconElement = readonly [tag: 'path' | 'circle' | 'rect' | 'ellipse' | 'polyline', attributes: Readonly<Record<string, string>>];

/**
 * Icons of the Vector Space client, on a 24 by 24 grid, drawn with a 2 unit round stroke. The shapes are Lucide icons
 * (ISC licence): `User`, `Bot`, `Inbox`, `Database`, `LayoutGrid`, `Globe`, `Cpu`, `Workflow`, `ContactRound` and `Plug`.
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
  connector: [['path', { d: 'M12 22v-5' }], ['path', { d: 'M15 8V2' }], ['path', { d: 'M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z' }], ['path', { d: 'M9 8V2' }]],
} as const satisfies Record<string, readonly IconElement[]>;

export type IconName = keyof typeof ICONS;
