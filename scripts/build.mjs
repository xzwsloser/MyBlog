import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import hugoPath from 'hugo-bin'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

if (!existsSync(hugoPath)) {
  const installResult = spawnSync(
    process.execPath,
    [resolve(root, 'node_modules/hugo-bin/lib/install.js')],
    {
      cwd: root,
      env: { ...process.env, INIT_CWD: root },
      stdio: 'inherit'
    }
  )

  if (installResult.status !== 0) {
    process.exit(installResult.status ?? 1)
  }
}

const buildResult = spawnSync(
  hugoPath,
  ['--gc', '--minify', '--cleanDestinationDir', '--destination', 'dist'],
  { cwd: root, stdio: 'inherit' }
)

process.exit(buildResult.status ?? 1)
