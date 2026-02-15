import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-real-data',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save-real-data' && req.method === 'POST') {
            let body = ''
            req.on('data', (chunk) => { body += chunk })
            req.on('end', () => {
              try {
                const filePath = path.join(process.cwd(), 'public', 'real-data.json')
                const parsed = JSON.parse(body)
                if (!Array.isArray(parsed.transactions)) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Invalid data: transactions array required' }))
                  return
                }
                fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8')
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true }))
              } catch (e) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: e.message || 'Failed to save' }))
              }
            })
            return
          }
          next()
        })
      },
    },
  ],
})
