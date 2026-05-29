# Node.js App Manager

> **Licence Project** — Demeter Norbert-Marton  
> A full-stack container management dashboard for deploying, monitoring, and managing Node.js applications in Docker — with real-time metrics, live log streaming, and instant crash notifications.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Production Deployment](#production-deployment)
- [API Reference](#api-reference)
- [Key Components](#key-components)
- [Crash Alert System](#crash-alert-system)
- [License](#license)

---

## Overview

**Node.js App Manager** is a self-hosted platform for running and observing Node.js applications inside isolated Docker containers. Built as a final-year licence thesis project, it demonstrates a production-grade approach to container orchestration at a small scale — combining a Python-based REST and WebSocket backend with a reactive TypeScript frontend.

This project delivers a focused, purpose-built dashboard: deploy a Node.js app in seconds, watch its CPU and memory in real time, tail its logs in a terminal-style viewer, and get an instant push notification on your phone the moment it crashes.

The system is designed to be operated by a system administrator, where the administrator brings pre-built Docker images and other Node.js applications, and the platform handles their lifecycle, monitoring, and alerting.

---

## Features

### Container Lifecycle Management
- **Deploy** new Node.js applications by specifying a name, Docker image, and target port — the administrator brings their own pre-built images
- **Start / Stop / Restart / Delete** containers from the dashboard with confirmation dialogs for destructive actions
- **Port and name conflict detection** — before deploying, the system checks whether the container name or host port is already in use and returns a clear error message instead of failing silently
- Automatic **on-failure restart policy** with a configurable retry limit (default: 3 retries)
- Containers are tagged with a `node-manager=managed` Docker label for clean isolation from unrelated containers

### Real-Time Monitoring
- **Per-container CPU and RAM** usage streamed live via WebSocket, updated every second
- **Aggregated system chart** showing combined CPU (%) and RAM (MB) over a rolling 20-second window, rendered with Chart.js
- Stats summary cards: running app count, total CPU usage, total memory consumption
- **Automatic WebSocket reconnection** — if the connection drops, the frontend reconnects automatically after 3 seconds with no user action required

### Live Log Streaming
- **Terminal-style log panel** that slides in from the right, supporting multiple containers as tabs
- Logs are streamed over WebSocket and updated every 2 seconds
- **Colour-coded output**: green for normal lines, red for errors and stack traces, yellow for warnings
- Timestamps are parsed and formatted from Docker's RFC3339 log format to a human-readable `YYYY-MM-DD HH:MM:SS` display

### Crash Detection and Push Notifications
- A background Docker **event listener** monitors all managed containers for unexpected exits
- On an abnormal exit (any exit code other than `0`, `137`, or `143`), the system:
  1. Fetches the last 200 log lines from the crashed container
  2. Runs a **log analyzer** that extracts structured Node.js error blocks (stack traces, `TypeError`, `EADDRINUSE`, `UnhandledPromiseRejection`, etc.)
  3. Sends a formatted **push notification via [ntfy.sh](https://ntfy.sh)** with the container name, exit code, and extracted error cause
- Intentional stops (manual stop/restart/delete) are tracked to suppress false alerts
- The ntfy server URL and topic are fully configurable via environment variables — supports self-hosted ntfy instances

### Environment-Based Configuration
- The **backend** is configured via a `.env` file — no need to touch source code when deploying
- The backend exposes a central `config.py` that is the single source of truth for all runtime settings
- The **frontend** uses no environment variables in production — API calls use relative URLs (`/api/...`) and WebSocket connections derive the host from `window.location`, making the frontend automatically adapt to any domain or IP

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  HTTP/REST  │  │  WS /stats   │  │    WS /logs        │   │
│  │  /api/...   │  │  per container│  │  per container    │   │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘   │
└─────────┼────────────────┼─────────────────────┼─────────────┘
          │                │                     │
┌─────────▼────────────────▼─────────────────────▼─────────────┐
│                        Nginx (port 80)                       │
│                                                              │
│  /          → serves frontend static files (dist/)           │
│  /api/      → proxy_pass to FastAPI :8000                    │
│  /api/monitor/ → proxy_pass + WebSocket upgrade to :8000     │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│                  127.0.0.1:8000 (internal only)              │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐   │
│  │  apps router │   │monitor router│   │  event listener │   │
│  │  (CRUD +     │   │  (WS stats + │   │  (background    │   │
│  │  conflict +  │   │   WS logs)   │   │   thread)       │   │
│  │  img check)  │   │              │   │                 │   │
│  └──────┬───────┘   └──────┬───────┘   └───────┬─────────┘   │
│         │                  │                   │             │
│  ┌──────▼──────────────────▼───────────────────▼──────────┐  │
│  │               NodeAppManager (Docker SDK)              │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│              Docker Engine (rootless in production)          │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│   │  custom      │  │  custom      │  │   custom         │   │
│   │  image       │  │  image       │  │   image          │   │
│   │  container   │  │  container   │  │   container      │   │
│   └──────────────┘  └──────────────┘  └──────────────────┘   │ 
└──────────────────────────────────────────────────────────────┘
                            │
               On crash → ntfy.sh push alert
```

In production the backend binds only to `127.0.0.1:8000` and is never directly exposed to the network. All traffic enters through Nginx on port 80. The frontend uses relative URLs (`/api/...`) so the browser always calls the same origin — Nginx handles the routing transparently. WebSocket connections use `window.location` to derive the correct host automatically, so no hardcoded URLs exist anywhere in the frontend.
---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| Python 3.10+ | Primary language |
| FastAPI | REST API + WebSocket server |
| Docker SDK for Python | Container lifecycle management |
| httpx | Async HTTP client for ntfy.sh notifications |
| python-dotenv | Environment variable loading |
| asyncio | Concurrency for the event listener |
| Uvicorn | ASGI server |

### Frontend
| Technology | Role |
|---|---|
| React 18 | UI framework |
| TypeScript | Type-safe development |
| Vite | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| Chart.js + react-chartjs-2 | CPU / RAM history chart |
| axios | HTTP client |
| react-hot-toast | Toast notifications and confirmations |
| lucide-react | Icon library |
| WebSocket API | Real-time stats and log streaming |

---

## Project Structure

```
node-app-manager/
├── backend/
│   └── app/
│       ├── .env.example         # Configuration template — copy to .env
│       ├── api/
│       │   ├── apps.py          # CRUD endpoints + port/name conflict detection
│       │   └── monitor.py       # WebSocket endpoints for stats and logs
│       ├── core/
│       │   ├── manager.py       # NodeAppManager — Docker SDK wrapper
│       │   └── events.py        # Docker event listener and crash detection
│       ├── services/
│       │   └── notifier.py      # ntfy.sh push notification sender
│       ├── utils/
│       │   └── log_analyzer.py  # Node.js error extractor from raw logs
│       ├── config.py            # Central settings — reads from .env
│       └── main.py              # FastAPI app setup, CORS, lifespan
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── CreateAppForm.tsx    # Deploy a new container
│       │   ├── DockerTable.tsx      # Container list with actions
│       │   ├── LogViewer.tsx        # Multi-tab log panel (sidebar)
│       │   ├── NtfyBanner.tsx       # Notification topic subscription UI
│       │   ├── StatsGrid.tsx        # Summary cards (apps, CPU, RAM)
│       │   ├── SystemChart.tsx      # Historical CPU/RAM line chart
│       │   └── TerminalSession.tsx  # Live log stream with auto-reconnect
│       ├── hooks/
│       │   └── useSystemMonitor.ts  # Custom hook: manages per-container WS pool
│       ├── services/
│       │   └── api.ts               # axios wrappers for all REST calls
│       ├── types/
│       │   └── index.ts             # Shared TypeScript interfaces
│       ├── utils/
│       │   ├── formatters.ts        # Port formatting helper
│       │   └── logParser.ts         # Log line parser + colour classification
│       └── App.tsx                  # Root component and layout
├── deploy/
│   ├── node-manager-backend.service  # systemd service file — copy to /etc/systemd/system/
│   └── nginx-node-manager.conf       # Nginx config — copy to /etc/nginx/sites-available/
├── requirements.txt
└── README.md
```

---

## Getting Started

### Prerequisites

- **Docker** installed and running on the host machine
- **Python 3.10+**
- **Node.js 18+** (LTS) and **npm** (only needed to build the frontend once)
- **Nginx** (for production serving)
- The user running the backend must belong to the `docker` group, or Docker must be running in rootless mode (recomended)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. (Recommended) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create your local .env from the template
cp .env.example .env

# 5. Edit .env and set your values (see Configuration below)
nano .env

# 6. Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive API documentation (Swagger UI) is auto-generated at `http://localhost:8000/docs`.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Build for production
npm run build
# Output is placed in the dist/ folder
```

> **No `.env` file is needed.** The frontend uses relative URLs (`/api/...`) for REST calls and derives the WebSocket host from `window.location` — it adapts automatically to whatever domain or IP Nginx is serving from.

For **local development** only (without Nginx):
```bash
npm run dev
# Available at http://localhost:5173
# The backend must be running at http://localhost:8000
```

The frontend will be available at `http://localhost:5173`.

---

## Configuration

All configuration is done via the backend `.env` file. Never commit `.env` to version control — only `.env.example` should be committed.

### Backend — `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `NTFY_TOPIC` | `NodeJS_App_Manager_123456789987654321` | The ntfy topic for crash alerts. Must match what is shown in the frontend dashboard. |
| `NTFY_URL` | `https://ntfy.sh` | The ntfy server base URL. Change this if you are self-hosting ntfy. |
| `CORS_ORIGINS` | `http://localhost:5173` | The URL the frontend is served from. Set this to your server IP or domain in production. |

**Production:**
```env
NTFY_TOPIC=NodeJS_App_Manager_123456789987654321
NTFY_URL=https://ntfy.sh
CORS_ORIGINS=http://your-server-ip
```

> **Frontend has no `.env` file.** API calls use relative paths and WebSocket connections use `window.location`, so no URL configuration is needed in the frontend regardless of where it is deployed.

After changing `backend/.env`, restart the backend service:
```bash
sudo systemctl restart node-manager-backend
```
---
## Production Deployment

### Overview

In production the system runs as two persistent services managed by systemd:

```
Server boot
    │
    ├── systemd → node-manager-backend  (uvicorn on 127.0.0.1:8000)
    └── systemd → nginx                 (port 80)
                   ├── /            → serves dist/ (React static files)
                   ├── /api/        → proxy to :8000 (REST)
                   └── /api/monitor/ → proxy to :8000 (WebSocket)
```


### 1. Clone the Repository

```bash
git clone https://github.com/Demeter-Norbert/node-app-manager.git
cd node-app-manager
```

### 2. Backend Setup

```bash
cd backend
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env   # Set CORS_ORIGINS to your server IP or domain
```

### 3. Install the Backend systemd Service

```bash
sudo cp deploy/node-manager-backend.service \
         /etc/systemd/system/node-manager-backend.service

# Edit the file if your username or path differs from the defaults
sudo nano /etc/systemd/system/node-manager-backend.service

sudo systemctl daemon-reload
sudo systemctl enable node-manager-backend
sudo systemctl start node-manager-backend

# Verify
sudo systemctl status node-manager-backend
```

### 4. Build and Deploy the Frontend

```bash
cd frontend
npm install
npm run build

# Copy the built files to the web directory
sudo mkdir -p /var/www/node-manager
sudo cp -r dist/* /var/www/node-manager/
```

### 5. Configure Nginx

```bash
sudo cp deploy/nginx-node-manager.conf \
         /etc/nginx/sites-available/node-manager

# Edit server_name to your server IP or domain
sudo nano /etc/nginx/sites-available/node-manager

sudo ln -s /etc/nginx/sites-available/node-manager \
           /etc/nginx/sites-enabled/
sudo nginx -t          # Should print: syntax is ok
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 7. Rootless Docker (Recommended for Security)

Running Docker in rootless mode means the daemon and all containers run as a normal user. If a container is ever compromised, it has no root access to the host.

```bash
# Install prerequisites
sudo apt install -y uidmap dbus-user-session

# Run the setup tool as your normal user (not sudo)
dockerd-rootless-setuptool.sh install

# Enable and start the rootless daemon
systemctl --user enable docker
systemctl --user start docker

# Persist the daemon across logouts
sudo loginctl enable-linger $USER

# Export the socket path (add to ~/.bashrc)
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock
```

Update the backend service file to point to the rootless socket:
```ini
Environment=DOCKER_HOST=unix:///run/user/1000/docker.sock
```
Replace `1000` with your actual UID (`id -u`).


### Updating the Frontend After Code Changes

```bash
cd frontend
npm run build
sudo cp -r dist/* /var/www/node-manager/
# Nginx picks up changes immediately — no restart needed
```

### Updating the Backend After Code Changes

```bash
sudo systemctl restart node-manager-backend
```

### Useful Service Commands

```bash
# Check backend status
sudo systemctl status node-manager-backend

# Watch backend logs live
sudo journalctl -u node-manager-backend -f

# Restart backend
sudo systemctl restart node-manager-backend

# Check Nginx status
sudo systemctl status nginx
```
---
## API Reference

All endpoints are prefixed with `/api`.

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |

### Application Management — `/api/apps`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/apps/` | List all managed containers |
| `POST` | `/api/apps/` | Deploy a new container |
| `POST` | `/api/apps/{id}/stop` | Stop a running container |
| `POST` | `/api/apps/{id}/resume` | Start a stopped container |
| `POST` | `/api/apps/{id}/restart` | Restart a container |
| `DELETE` | `/api/apps/{id}` | Stop and permanently remove a container |

**Deploy payload example:**
```json
{
  "name": "name.example",
  "image": "my-custom-node-image:latest",
  "target_port": 3000
}
```

**Conflict responses** — the deploy endpoint returns `HTTP 409 Conflict` when:
- A container with the given `name` already exists (running or stopped)
- The given `target_port` is already bound on the host by any container

```json
{ "detail": "A container named 'name.example' already exists. Choose a different name." }
{ "detail": "Port 3000 is already in use by another container. Choose a different port." }
```

- `HTTP 404` if the image name does not exist:
```json
{ "detail": "Image 'node:99-alpine' not found. Check the image name and make sure it exists." }
```
### Monitoring — `/api/monitor` (WebSocket)

| Protocol | Endpoint | Description |
|---|---|---|
| `WS` | `/api/monitor/{id}/stats/ws` | Real-time CPU and memory stats (1 s interval) |
| `WS` | `/api/monitor/{id}/logs/ws` | Live log stream (2 s interval, last 100 lines) |

**Stats message shape:**
```json
{
  "id": "abc123",
  "memory_usage_bytes": 52428800,
  "memory_limit_bytes": 8368308224,
  "memory_percent": 0.63,
  "cpu_percent": 1.45
}
```
---

## Key Components

### `NodeAppManager` (`backend/app/core/manager.py`)

The central service class that wraps the Docker SDK. Before starting any container it runs two pre-flight checks via `is_name_taken()` and `is_port_taken()`, querying the Docker daemon directly so conflicts are caught before they cause a cryptic failure. It also maintains an `intentional_stops` set to distinguish user-initiated stops from unexpected crashes, ensuring crash alerts are never triggered by deliberate actions.

### `config.py` (`backend/app/config.py`)

The single source of truth for all backend settings. Reads from the `.env` file via `python-dotenv` and exports typed constants (`NTFY_TOPIC`, `NTFY_URL`, `CORS_ORIGINS`) imported by the rest of the application. Centralizing settings here means configuration is changed in one place and never scattered across source files.

### `useSystemMonitor` (`frontend/src/hooks/useSystemMonitor.ts`)

A custom React hook that manages a dynamic pool of WebSocket connections — one per running container. It aggregates per-container stats into a rolling time-series for the chart and individual stats for the table. Connections are opened and closed automatically as containers appear or disappear. Each connection includes automatic reconnection: if a socket closes unexpectedly, a new one is opened after 3 seconds, but only if that container is still being tracked — preventing ghost connections from accumulating.

### `TerminalSession` (`frontend/src/components/TerminalSession.tsx`)

Streams live logs for a single container over WebSocket. Uses an `isClosed` flag to guard against reconnect attempts after the component unmounts, and calls `ws?.close()` unconditionally during cleanup — which previously left sockets stuck in the `CONNECTING` state as orphans when closed too early.

### `logParser.ts` (`frontend/src/utils/logParser.ts`)

Parses raw Docker log lines into structured `ParsedLog` objects. Implements a stateful pass that tracks whether a line is inside an error block, applying colour rules accordingly: errors and stack traces render in red, warnings in yellow, and normal output in green.

### `log_analyzer.py` (`backend/app/utils/log_analyzer.py`)

A regex-based extractor that scans raw container logs for known Node.js error patterns (`TypeError`, `ReferenceError`, `UnhandledPromiseRejection`, `EADDRINUSE`, `FATAL ERROR`, etc.). Reconstructs complete error blocks including stack trace lines, deduplicates them, and caps the output at 800 characters for clean notification payloads.

---

## Crash Alert System

The crash detection pipeline works as follows:

1. **Event Listener** (`core/events.py`) — runs in a background thread on startup via `run_in_executor`, listening to the Docker event stream filtered for `container die` events on managed containers.
2. **Exit Code Filtering** — exits with code `0` (clean), `137` (SIGKILL), or `143` (SIGTERM) are considered intentional and ignored. Only genuinely unexpected crashes are processed.
3. **Intentional Stop Guard** — if the container ID is in the `intentional_stops` set (populated by manual stop/restart/delete), the alert is suppressed and the ID is removed from the set.
4. **Log Extraction** — the last 200 log lines are fetched and passed through `log_analyzer.py` to extract the relevant error block.
5. **Push Notification** — `notifier.py` uses `asyncio.run_coroutine_threadsafe()` to schedule an async HTTP POST onto the main event loop, sending the alert to the configured ntfy server and topic.

To receive alerts on your phone, install the [ntfy app](https://ntfy.sh) and subscribe to the topic shown in the dashboard's notification banner.

---

## License

This project was developed as a **licence thesis** at the Sapientia Hungarian University of Transylvania, Faculty of Technical and Human Sciences.

**Author:** Demeter Norbert-Marton  
**Year:** 2026

---

*Built with FastAPI, React, TypeScript, Docker SDK, and a lot of WebSockets.*
