/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies break tooling and signal layering issues.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-cross-module',
      severity: 'error',
      comment:
        'Cross-module imports are forbidden except via contracts (events, ports). Share code via shared-kernel or decouple through events.',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: [
          '^src/modules/$1/',
          // Cross-context contracts: domain events and application ports.
          // Per api rules, events live in publisher's domain/events/, ports in publisher's application/ports/
          // (until promoted to shared-kernel when consumers ≥ 2).
          '^src/modules/[^/]+/domain/events/',
          '^src/modules/[^/]+/application/ports/',
        ],
      },
    },
    {
      name: 'shared-kernel-no-modules',
      severity: 'error',
      comment: 'shared-kernel must not import business modules.',
      from: { path: '^src/shared-kernel/' },
      to: { path: '^src/modules/' },
    },
    {
      name: 'app-no-modules',
      severity: 'error',
      comment: 'The app layer must not directly depend on business modules.',
      from: { path: '^src/app/' },
      to: { path: '^src/modules/' },
    },
    {
      name: 'service-no-database-runtime',
      severity: 'error',
      comment:
        'Services must not runtime-import @workspace/database. Go through repository ports instead. Type-only imports are allowed.',
      from: { path: '^src/modules/[^/]+/application/services/' },
      to: {
        path: '^@workspace/database',
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'domain-no-external-libs',
      severity: 'error',
      comment:
        'Domain layer must stay free of runtime libraries (@nestjs/*, drizzle, bcrypt, pino, ...). Test files (vitest) are exempt.',
      from: {
        path: '^src/modules/[^/]+/domain/',
        pathNot: '\\.spec\\.ts$',
      },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-no-pkg'] },
    },
    {
      name: 'presentation-no-database',
      severity: 'error',
      comment:
        'Presentation layer must not access the database directly. Go through application services.',
      from: { path: '^src/modules/[^/]+/presentation/' },
      to: { path: '^(@workspace/database|drizzle-orm|pg|postgres)($|/)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    includeOnly: '^src/',
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['main', 'types'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
}
