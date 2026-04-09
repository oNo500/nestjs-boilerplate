import {
  base,
  boundaries,
  drizzle,
  jsdoc,
  node,
  promise,
  unicorn,
  vitest,
} from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base,
    unicorn,
    node,
    promise,
    jsdoc,
    drizzle,
    vitest,
    boundaries({
      elements: [
        {
          type: 'module',
          pattern: 'src/modules/*/**',
          capture: ['moduleName'],
          mode: 'folder',
        },
        {
          type: 'shared-kernel',
          pattern: 'src/shared-kernel/**',
          mode: 'folder',
        },
        {
          type: 'app',
          pattern: 'src/app/**',
          mode: 'folder',
        },
        {
          type: 'main',
          pattern: ['src/main.ts', 'src/*.module.ts', 'src/*.d.ts'],
          mode: 'file',
        },
      ],
      rules: [
        {
          from: ['module'],
          allow: [
            'shared-kernel',
            'app',
            ['module', { moduleName: '${moduleName}' }],
          ],
          message: 'Cross-module imports are forbidden. Share code via shared-kernel or decouple through events.',
        },
        {
          from: ['shared-kernel'],
          allow: ['shared-kernel', 'app'],
          message: 'shared-kernel must not import business modules',
        },
        {
          from: ['app'],
          allow: ['app', 'shared-kernel'],
          message: 'The app layer should not directly depend on business modules',
        },
        {
          from: ['main'],
          allow: ['module', 'shared-kernel', 'app', 'main'],
        },
      ],
    }),
  ],
})
