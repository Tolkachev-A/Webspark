import { defineConfig } from 'vite'
import { resolve } from 'path'
import { createReadStream, statSync } from 'fs'

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  },
  plugins: [
    {
      name: 'serve-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/assets/')) {
            const filePath = resolve('src', req.url)
            try {
              const stats = statSync(filePath)
              const ext = filePath.split('.').pop()?.toLowerCase() || ''
              const types = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                gif: 'image/gif',
                svg: 'image/svg+xml',
                webp: 'image/webp',
                woff2: 'font/woff2'
              }
              res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
              res.setHeader('Content-Length', stats.size)
              const stream = createReadStream(filePath)
              stream.pipe(res)
            } catch (err) {
              next()
            }
            return
          }
          next()
        })
      }
    },
    {
      name: 'transform-asset-paths',
      generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'chunk' && chunk.code) {
            chunk.code = chunk.code.replace(/"src\/assets\//g, '"assets/')
          }
        }
      }
    },
    {
      name: 'copy-assets',
      closeBundle() {
        const { cp } = require('fs/promises')
        const { resolve } = require('path')
        cp(resolve('src/assets'), resolve('dist/assets'), { recursive: true })
          .then(() => console.log('Assets copied to dist'))
          .catch(err => console.error('Failed to copy assets:', err))
      }
    }
  ]
})
