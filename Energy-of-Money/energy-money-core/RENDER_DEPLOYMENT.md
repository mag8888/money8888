Render: Deploy Front + Back Together

Overview
- One Render Web Service serves React build and Socket.IO backend on the same domain.
- Persistent SQLite DB stored on attached disk.
- No CORS issues (same origin).

What’s Prepared
- `render.yaml`: Blueprint config to build client, install server, attach disk, and start `node server/index.js`.
- `server/index.js`: Serves `client/build` statics and has SPA fallback. Socket.IO runs on same host.
- `server/database.js`: Uses `DATABASE_FILE` or `DATABASE_URL` (sqlite) or local fallback.
- `server/package.json`: Server dependencies and `start` script.
- `client` uses CRA with React 18 for reliable build on Render free tier.

Deploy via Blueprint (recommended)
1. In Render dashboard: New → Blueprint → pick this repository.
2. Review and Deploy. Render creates a Web Service from `render.yaml`.
3. Wait for build to complete. First deploy can take several minutes.

Deploy manually (without Blueprint)
- New → Web Service → Connect Repo → Root Directory: repo root
- Build Command:
  - `npm --prefix client ci || npm --prefix client install`
  - `npm --prefix client run build`
  - `npm --prefix server ci || npm --prefix server install`
- Start Command: `node server/index.js`
- Environment:
  - `NODE_ENV=production`
  - `DATABASE_FILE=/var/data/game.db`
- Disk:
  - Add disk, Mount Path `/var/data`, Size `1GB`

After Deploy
- Health check: open `/health` on your Render URL
  - Example: `https://energy-of-money-app.onrender.com/health`
- App root should serve the React app from `client/build`.
- Socket.IO uses same origin and should connect automatically.

Domains
- Free: Render assigns `*.onrender.com` automatically (no action needed).
- Custom: Render → Settings → Custom Domains → add your domain, follow DNS instructions (CNAME/ALIAS).

Notes
- Free plan may idle; first request after idle can be slower and can affect WebSocket connect time.
- Disk persists `game.db`; consider backups if data critical.
- For analytics/logs: use Render Logs; check `server/index.js` startup output for URLs.

Verify
- Root: `GET /` returns app HTML
- Health: `GET /health` returns `{ status: 'OK', ... }`
- Rooms API: `GET /api/rooms` returns list
- Socket.IO: client console shows `Connected` with id

