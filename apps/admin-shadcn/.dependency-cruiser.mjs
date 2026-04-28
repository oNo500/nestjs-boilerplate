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
      name: 'no-cross-feature',
      severity: 'error',
      comment:
        'Features must not import each other. Promote shared code to src/components, src/hooks, src/lib, or src/config.',
      from: {
        path: '^src/features/([^/]+)/',
        pathNot: [
          // Known design debt: roles-table reuses user-management's role-assignment hook.
          // Remove this exception once roles feature scope is resolved. See issue #13.
          '^src/features/roles/components/roles-table\\.tsx$',
        ],
      },
      to: {
        path: '^src/features/([^/]+)/',
        pathNot: '^src/features/$1/',
      },
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
