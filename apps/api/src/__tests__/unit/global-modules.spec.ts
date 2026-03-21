import fs from 'node:fs'
import { glob } from 'node:fs/promises'
import path from 'node:path'

/**
 * Architecture guard: @Global() usage
 *
 * Only modules explicitly marked with `@global-approved` are allowed to use @Global().
 * To add a new global module:
 *   1. Add `// @global-approved: &lt;reason>` on the same line as @Global()
 *   2. Add the module file path to APPROVED_GLOBAL_MODULES below
 *   3. Update ARCHITECTURE.md @Global() table
 */

const APPROVED_GLOBAL_MODULES = new Set([
  'src/app/database/db.module.ts',
  'src/app/events/domain-events.module.ts',
  'src/modules/cache/cache.module.ts',
  'src/modules/audit-log/audit-log.module.ts',
  'src/modules/auth/auth.module.ts',
  'src/modules/identity/identity.module.ts',
])

const SRC_ROOT = path.resolve(import.meta.dirname, '../../../')

async function findModuleFiles(): Promise<string[]> {
  const files: string[] = []
  for await (const file of glob('**/*.module.ts', { cwd: SRC_ROOT })) {
    files.push(file)
  }
  return files
}

describe('architecture: @Global() usage', () => {
  let moduleFiles: string[]

  beforeAll(async () => {
    moduleFiles = await findModuleFiles()
  })

  it('every @Global() module must have @global-approved comment on the same line', () => {
    const violations: string[] = []

    for (const file of moduleFiles) {
      const content = fs.readFileSync(path.join(SRC_ROOT, file), 'utf8')
      const lines = content.split('\n')

      for (const line of lines) {
        if (line.includes('@Global()') && !line.includes('@global-approved')) {
          violations.push(`${file}: missing @global-approved comment`)
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('every @global-approved module must be in the approved whitelist', () => {
    const violations: string[] = []

    for (const file of moduleFiles) {
      const content = fs.readFileSync(path.join(SRC_ROOT, file), 'utf8')

      if (content.includes('@global-approved') && !APPROVED_GLOBAL_MODULES.has(file)) {
        violations.push(`${file}: not in APPROVED_GLOBAL_MODULES — add it or remove @Global()`)
      }
    }

    expect(violations).toEqual([])
  })

  it('every module in the approved whitelist must actually use @Global()', () => {
    const violations: string[] = []

    for (const file of APPROVED_GLOBAL_MODULES) {
      const fullPath = path.join(SRC_ROOT, file)
      if (!fs.existsSync(fullPath)) {
        violations.push(`${file}: file not found — remove from APPROVED_GLOBAL_MODULES`)
        continue
      }
      const content = fs.readFileSync(fullPath, 'utf8')
      if (!content.includes('@Global()')) {
        violations.push(`${file}: does not use @Global() — remove from APPROVED_GLOBAL_MODULES`)
      }
    }

    expect(violations).toEqual([])
  })
})
