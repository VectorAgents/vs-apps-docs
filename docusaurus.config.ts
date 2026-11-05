import { themes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import embedFile from './src/plugins/embed-file.mjs';
import { flavourStyle, headScript } from './src/flavours/head-script.mjs';
import pkg from './package.json' with { type: 'json' };
import flavours from './flavours.config.json' with { type: 'json' };

const sdkVersion = pkg.dependencies['@vectoragents/vs-apps'];
const flavourSite = { axes: flavours.axes, defaults: flavours.defaults };
const docsDir = `${flavours.outDir}/site`;

const config: Config = {
  title: 'Vector Apps docs',
  tagline: 'Build apps for Vector Space with @vectoragents/vs-apps',
  url: process.env.DOCS_URL ?? 'https://docs.example.com',
  baseUrl: process.env.DOCS_BASE_URL ?? '/',
  onBrokenLinks: 'throw',
  markdown: { mermaid: true },
  customFields: { sdkVersion, flavourSite },
  clientModules: ['./src/flavours/client.ts'],
  headTags: [
    { tagName: 'style', attributes: {}, innerHTML: flavourStyle(flavours.axes) },
    { tagName: 'script', attributes: {}, innerHTML: headScript(flavours.axes, flavours.defaults) },
  ],
  presets: [
    [
      'classic',
      {
        docs: { path: docsDir, routeBasePath: '/', sidebarPath: './sidebars.ts', beforeDefaultRemarkPlugins: [embedFile] },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      },
    ],
  ],
  themes: [
    '@docusaurus/theme-mermaid',
    ['@easyops-cn/docusaurus-search-local', { docsDir, docsRouteBasePath: '/', indexBlog: false, hashed: true }],
  ],
  themeConfig: {
    navbar: {
      title: 'Vector Apps docs',
      items: [
        { to: '/builder', label: 'Definition builder', position: 'left' },
        { type: 'custom-flavourPicker', position: 'right' },
        { type: 'html', position: 'right', value: `<span class="sdk-version">@vectoragents/vs-apps ${sdkVersion}</span>` },
      ],
    },
    prism: { theme: themes.github, darkTheme: themes.dracula },
  },
};

export default config;
