import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const distDir = join(root, 'dist')
const preferredPort = Number.parseInt(process.env.PORT ?? process.argv[2] ?? '4321', 10)
const host = process.env.HOST ?? '127.0.0.1'

if (!existsSync(distDir)) {
  console.error('Missing build output. Run `bun run build` before `bun preview`.')
  process.exit(1)
}

const contentTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
}

function getStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname)
  const relativePath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '')
  const filePath = join(distDir, relativePath)

  if (!filePath.startsWith(distDir + sep) && filePath !== distDir) {
    return null
  }

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath
  }

  const indexPath = join(filePath, 'index.html')
  if (existsSync(indexPath) && statSync(indexPath).isFile()) {
    return indexPath
  }

  return null
}

function serveFile(res, filePath, method) {
  const headers = {
    'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream'
  }
  if (filePath.includes(`${sep}_astro${sep}`)) {
    headers['cache-control'] = 'public, max-age=31536000, immutable'
  }

  res.writeHead(200, headers)
  if (method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(filePath).pipe(res)
}

function handleRequest(req, res) {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

    // Trailing slash redirect (except root)
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
      res.writeHead(308, { location: `${url.pathname}${url.search}` })
      res.end()
      return
    }

    const staticPath = getStaticPath(url.pathname)
    if (staticPath) {
      serveFile(res, staticPath, req.method)
      return
    }

    // SPA fallback: serve index.html for unmatched routes
    const fallback = join(distDir, 'index.html')
    if (existsSync(fallback)) {
      serveFile(res, fallback, req.method)
      return
    }

    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
  } catch (error) {
    console.error(error)
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Internal Server Error')
  }
}

function listen(currentPort) {
  const server = createServer((req, res) => handleRequest(req, res))

  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && currentPort < preferredPort + 10) {
      console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`)
      listen(currentPort + 1)
      return
    }
    throw error
  })

  server.listen(currentPort, host, () => {
    console.log(`Preview server running at http://${host}:${currentPort}/`)
  })
}

listen(preferredPort)
