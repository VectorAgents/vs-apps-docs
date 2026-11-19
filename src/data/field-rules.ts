export interface FieldRule {
  /** Dotted path from the definition root; `[]` marks an array item. */
  path: string;
  required: boolean;
  /** Markdown the app-definition page repeats verbatim, checked by a test. Links go to `docs/sdk/reference/platform-limits.md` only; the builder strips them. */
  rule: string;
  /** Regular expression source the value must match, when the rule is a pattern. */
  pattern?: string;
}

// The builder reads these closed lists; the published pages hold them only in platform-limits.md.
export const modalities = ['chat', 'vision', 'embed', 'rerank'] as const;
export const modelProviders = ['ANTHROPIC', 'AZURE_OPENAI', 'COHERE', 'AZURE_DOCUMENT_INTELLIGENCE'] as const;
export const modelCapabilities = ['toolCalling', 'structuredOutput', 'reasoningOutput', 'promptCaching', 'streaming'] as const;
export const connectorProviders = [
  'REST',
  'GRAPHQL',
  'MCP',
  'GOOGLE',
  'CLICKUP',
  'EXA',
  'FIRECRAWL',
  'INSTANTLY',
  'UNIPILE',
  'APOLLO',
  'META',
  'BRIGHTDATA',
] as const;

const limits = (anchor: string, text: string): string => `[${text}](./reference/platform-limits.md#${anchor})`;
const kebab = '^[a-z][a-z0-9-]*$';

export const coreFieldRules: FieldRule[] = [
  {
    path: 'key',
    required: true,
    rule: 'Lower kebab-case, 2-63 characters, starts with a letter.',
    pattern: '^[a-z][a-z0-9-]{1,62}$',
  },
  { path: 'name', required: false, rule: 'Display name, 1-80 characters.' },
  { path: 'version', required: true, rule: 'Non-empty string, not checked as semver.' },
  { path: 'pages', required: true, rule: 'At least one page, listed in navigation order.' },
  { path: 'defaultPageKey', required: false, rule: 'When set, must equal a declared page key.' },
  { path: 'permissions', required: true, rule: 'An array of permissions, where `permissions: []` is valid.' },
  {
    path: 'pages[].key',
    required: true,
    rule: 'Lower kebab-case and unique within the app, checked by `buildManifests` and not at import.',
    pattern: kebab,
  },
  { path: 'pages[].label', required: true, rule: 'Non-empty string.' },
  { path: 'pages[].path', required: true, rule: 'String that starts with `/`.' },
  {
    path: 'pages[].permission',
    required: false,
    rule: 'One permission key, and a page without one has no gate.',
    pattern: '^[a-z][a-z0-9-]*(:[a-z][a-z0-9-]*)+$',
  },
  {
    path: 'permissions[].key',
    required: true,
    rule: 'Form `<group>:<action>` in lower kebab-case, with two or more segments.',
    pattern: '^[a-z][a-z0-9-]*(:[a-z][a-z0-9-]*)+$',
  },
  { path: 'permissions[].label', required: true, rule: 'Non-empty string.' },
  { path: 'permissions[].description', required: false, rule: 'String.' },
  { path: 'permissions[].effect', required: true, rule: '`"read"` or `"write"`.' },
];

export const resourceFieldRules: FieldRule[] = [
  { path: 'resources', required: false, rule: 'An object that declares what the app needs from each space.' },
  { path: 'resources.modules[].key', required: true, rule: 'Non-empty string, unique within modules.' },
  { path: 'resources.modules[].required', required: true, rule: 'Boolean.' },
  { path: 'resources.modules[].label', required: false, rule: 'Display label.' },
  { path: 'resources.models[].key', required: true, rule: 'Lower kebab-case slot key.', pattern: kebab },
  {
    path: 'resources.models[].modality',
    required: true,
    rule: `One of the ${limits('modalities', 'modalities')}.`,
  },
  {
    path: 'resources.models[].providers',
    required: true,
    rule: `At least one of the ${limits('model-providers', 'model providers')}.`,
  },
  { path: 'resources.models[].label', required: false, rule: 'Display label, the slot key by default.' },
  { path: 'resources.models[].description', required: false, rule: 'String.' },
  {
    path: 'resources.models[].models',
    required: false,
    rule: 'Exact model identifiers as the provider names them, at least one when set.',
  },
  {
    path: 'resources.models[].capabilities',
    required: false,
    rule: `Each one of the ${limits('capability-filters', 'capability filters')}.`,
  },
  { path: 'resources.models[].required', required: true, rule: 'Boolean.' },
  { path: 'resources.connectors[].key', required: true, rule: 'Lower kebab-case slot key.', pattern: kebab },
  {
    path: 'resources.connectors[].provider',
    required: true,
    rule: `One of the ${limits('connector-providers', 'connector providers')}.`,
  },
  { path: 'resources.connectors[].label', required: false, rule: 'Display label, the slot key by default.' },
  { path: 'resources.connectors[].required', required: true, rule: 'Boolean.' },
  {
    path: 'resources.connectors[].eventHandlers',
    required: false,
    rule: 'At least one handler when set, with the fields of `eventHandlers[]`.',
  },
  {
    path: 'resources.connectors[].eventHandlers[].key',
    required: true,
    rule: 'Lower kebab-case handler key, unique within the connector slot.',
    pattern: kebab,
  },
  { path: 'resources.connectors[].eventHandlers[].label', required: true, rule: 'Non-empty string.' },
  { path: 'resources.connectors[].eventHandlers[].description', required: false, rule: 'String.' },
  {
    path: 'resources.connectors[].eventHandlers[].defaultEventTypes',
    required: false,
    rule: 'At least one lower-case slug when set, each the default of one handler only.',
  },
  {
    path: 'resources.connectors[].eventHandlers[].singleEventType',
    required: false,
    rule: '`defaultEventTypes` must hold at most one type when `singleEventType` is `true`.',
  },
];
