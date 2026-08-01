import { $ } from 'bun'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ===== Configuration =====
// Set these via environment variables or .env file:
//   DEPLOY_HOST=60.204.204.84
//   DEPLOY_USER=root
//   DEPLOY_PASSWORD=your_password
//   DEPLOY_PATH=/var/www/xiaozhiwei.tech

const HOST = process.env.DEPLOY_HOST || '60.204.204.84'
const USER = process.env.DEPLOY_USER || 'root'
const PASSWORD = process.env.DEPLOY_PASSWORD
const REMOTE_DIR = process.env.DEPLOY_PATH || '/var/www/xiaozhiwei.tech'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')

// Validate
if (!PASSWORD) {
  console.error('\n❌ DEPLOY_PASSWORD is not set.')
  console.error('   Set it via: export DEPLOY_PASSWORD="your_password"')
  console.error('   Or create a .env file with DEPLOY_PASSWORD=your_password')
  process.exit(1)
}

// ===== Build =====
console.log('\n🔨 Building project...')
const buildResult = await $`bun run build`.cwd(root).quiet()
if (buildResult.exitCode !== 0) {
  console.error('Build failed!')
  process.exit(1)
}
console.log('✅ Build complete')

if (!existsSync(distDir)) {
  console.error(`Dist directory not found: ${distDir}`)
  process.exit(1)
}

// ===== Check sshpass =====
const sshpassCheck = await $`which sshpass`.quiet()
if (sshpassCheck.exitCode !== 0) {
  console.error('\n❌ sshpass is not installed.')
  console.error('   macOS: brew install sshpass')
  console.error('   Linux: apt install sshpass')
  process.exit(1)
}

const sshOpts = '-o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/dev/null'

// ===== Deploy =====
console.log(`\n📦 Deploying to ${USER}@${HOST}:${REMOTE_DIR} ...`)

// Ensure remote directory exists
await $`sshpass -p ${PASSWORD} ssh ${sshOpts} ${USER}@${HOST} mkdir -p ${REMOTE_DIR}`.quiet()

// Rsync files
const rsyncResult = await $`sshpass -p ${PASSWORD} rsync -avz --delete \
  -e ${`ssh ${sshOpts}`} \
  ${distDir}/ ${USER}@${HOST}:${REMOTE_DIR}/`.quiet()

if (rsyncResult.exitCode !== 0) {
  console.error('❌ Deploy failed!')
  process.exit(1)
}
console.log('✅ Files deployed')

// Reload nginx
console.log('\n🔄 Reloading nginx...')
const nginxResult = await $`sshpass -p ${PASSWORD} ssh ${sshOpts} ${USER}@${HOST} systemctl reload nginx`.quiet()
if (nginxResult.exitCode === 0) {
  console.log('✅ Nginx reloaded')
} else {
  console.warn('⚠️  Nginx reload failed (may need manual reload)')
}

console.log(`\n🎉 Deployed to https://xiaozhiwei.tech\n`)
