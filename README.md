# akapal-geap-ui — E\*TRADE-like Brokerage SPA

Framework-free E\*TRADE mock UI with chat panel connected to the GEAP agent service. No build step — plain HTML/CSS/JS served by the Node server (`server.js`), which also provides the Google News search proxy, sessions, and compression.

This is the standalone frontend project, extracted from the GEAP monorepo. The backend agent service lives in the [GEAP_P](https://github.com/akashh94/GEAP_P) repository.

## Quick Start

```bash
npm install
npm start        # runs node server.js on PORT (default 3000)
```

Point your browser to `http://localhost:3000`. The UI runs in mock mode with synthetic data out of the box.

## Connecting to the Agent Service

Set the agent service URL in `index.html`:

```html
<script>
  window.GEAP_AGENT_URL = "http://localhost:8080";
</script>
```

Or with Docker:

```bash
docker build -t geap-ui .
docker run -p 3000:8080 geap-ui
```

## Cloud Run Build & Deploy

Run from this repo's root (Cloud Shell).

```bash
# Build + push the image to Artifact Registry, tagged with the short commit SHA
./geap-ui-cloud_shell_build.sh

# Deploy the image to Cloud Run as akapal-geap-ui (on main); akapal-geap-ui-beta on release/beta
./geap-ui-cloud_shell_deploy.sh
```

The deploy script sets `NODE_ENV=production` (secure session cookies, 1h static asset cache). Set `SESSION_SECRET` via Cloud Run to a strong random value — in production it is required (no fallback).

## Structure

```
├── index.html          # SPA shell
├── css/                # Stylesheets (committed .min.css build artifacts)
├── js/
│   ├── app.js          # SPA router, views, GeapApp compatibility layer
│   ├── data.js         # BrokerageData — mock portfolio data
│   ├── charts.js       # Canvas chart rendering
│   ├── agents.js       # Frontend-side mock agent tools
│   ├── adk.js          # ADK SSE streaming client
│   ├── chat.js         # Chat panel UI
│   ├── agent-studio.js # Agent Studio view
│   ├── agent-fabric.js # Agent Fabric view
│   └── ...             # Other view controllers
├── server.js           # Node server: static files, SPA routes, /api/search proxy
├── Dockerfile          # Node-based container
└── README.md
```
