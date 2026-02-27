import { defineConfig } from 'taze'

export default defineConfig({
  // Do not exclude any packages
  exclude: [],

  // Force fetch the latest version information
  force: true,

  // Write directly to package.json
  write: true,

  // Install immediately after upgrade
  install: true,

  // All dependencies default to upgrading to latest
  packageMode: {
    '/.*/': 'latest',
  },

  // Also handle overrides / resolutions
  depFields: {
    dependencies: true,
    devDependencies: true,
    peerDependencies: true,
    optionalDependencies: true,
    overrides: true,
    resolutions: true,
  },

  // Scan all workspaces in the monorepo
  ignoreOtherWorkspaces: false,
})
