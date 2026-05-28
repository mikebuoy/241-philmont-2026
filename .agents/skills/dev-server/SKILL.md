---
name: dev-server
description: Launch, kill, and restart the Next.js dev server for the Tooth of Time app (localhost:3000)
---

# Dev Server — Tooth of Time

Project root: `/Users/mbuoy/git-projects/philmont-2026`

## Launch

Use `npm run dev`. The package script intentionally runs `next dev --webpack`; raw `next dev` uses Turbopack and has caused repeated admin-page reloads on localhost.

Start the dev server in the background and tail the log:

```bash
cd /Users/mbuoy/git-projects/philmont-2026
npm run dev > /tmp/philmont-dev.log 2>&1 &
echo "PID: $!"
```

Confirm it started:
```bash
sleep 3 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expect `200`. The log should show `Next.js 16.2.6 (webpack)`. If port 3000 is taken, Next.js auto-uses 3001 — check `/tmp/philmont-dev.log` for the active URL.

## Kill

Find and kill any running Next.js dev server for this project:

```bash
# Kill by process name (catches all next dev processes)
pkill -f "next dev" 2>/dev/null; echo "done"

# Verify ports are free
lsof -ti :3000 -ti :3001 | xargs kill -9 2>/dev/null; echo "ports clear"
```

## Restart

Kill, then start:

```bash
pkill -f "next dev" 2>/dev/null
lsof -ti :3000 -ti :3001 | xargs kill -9 2>/dev/null
sleep 1
cd /Users/mbuoy/git-projects/philmont-2026
npm run dev > /tmp/philmont-dev.log 2>&1 &
sleep 3 && curl -s -o /dev/null -w "Server status: %{http_code}\n" http://localhost:3000
```

## Check status

```bash
lsof -i :3000 -i :3001 | grep LISTEN
```

## Notes

- Moving the project folder does not break Next.js — it is stateless about directory location.
- If the previous terminal session had a server running (from a different terminal or IDE), `pkill -f "next dev"` will catch it regardless.
- If an admin itinerary edit page continuously reloads and the sign-in/sign-out control appears to flicker, confirm the server is running Webpack, not Turbopack. Turbopack has printed `Failed to write app endpoint /admin/(private)/roster/page` and `Next.js package not found` during this loop.
- If you see visual oddities after a hard restart, clear `.next/` cache: `rm -rf /Users/mbuoy/git-projects/philmont-2026/.next` then restart.
- Log tails: `tail -f /tmp/philmont-dev.log`
