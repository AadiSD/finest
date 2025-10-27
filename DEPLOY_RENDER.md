# Deploying to Render (quickstart)

This project is a fullstack Vite + Express Node app. It builds the frontend and bundles the server in `npm run build`, and starts the server with `npm start`.

Use the instructions below to deploy to Render. You can use the UI or the included `render.yaml` to deploy using Infrastructure as Code.

1) Connect your GitHub repo
- Go to https://dashboard.render.com
- Connect your GitHub account and authorize the `AadiSD/finest` repository.

2) Create a new Web Service (UI) or apply `render.yaml`
- UI: Create -> Web Service
  - Name: finest-web
  - Environment: Node
  - Branch: main
  - Build Command: npm ci && npm run build
  - Start Command: npm start
  - Instance Type / Plan: free (or choose a paid plan for higher limits)

- IaC: If you prefer, the `render.yaml` file at repo root describes the same service. Use the Render CLI or web UI to import it.

3) Add environment variables / secrets
- In the service settings add the following env vars (do NOT commit them to git):
  - DATABASE_URL — set to your managed Postgres connection string (Render Postgres, Neon, Supabase, Railway, etc.)
  - SESSION_SECRET — long secret used to sign sessions
  - NODE_ENV — production
  - Any other keys you use (e.g., SMTP, OAUTH_CLIENT_ID/SECRET, RESEND_API_KEY)

4) Attach a managed Postgres database (recommended)
- In Render dashboard: Databases -> New Database -> Postgres
- Create a database (choose plan), then copy the DATABASE_URL to the service env vars.

5) Configure session store for production
- If you currently use in-memory session store, switch to `connect-pg-simple` or Redis. Example env usage:
  - SESSION_SECRET (set on Render)
  - DATABASE_URL (set on Render)

6) Health checks and scaling
- Set a health check path if your app exposes one (e.g., `/health` that returns 200).
- Configure autoscaling or instance counts based on traffic.

7) Domain & TLS
- Add a custom domain in the Render UI and follow the DNS instructions.

8) Deployments and logs
- Render will build and deploy on every push to `main` (auto-deploy). Use the Render dashboard to view build logs and runtime logs.

9) Optional: Use Redis for sessions
- If you require faster session performance or plan to scale horizontally, add a managed Redis instance and use `connect-redis`.

Notes & checklist
- Ensure `.gitignore` excludes local files and secrets (already updated).
- Confirm `npm run build` completes locally before pushing (it runs Vite build + esbuild server bundling).
- If you prefer a Docker-based deploy, add a `Dockerfile` and change `render.yaml` to use `env: docker`.

If you want, I can:
- Create a `render.yaml` IAC (done) and add a `Dockerfile` for container deploy.
- Wire `connect-pg-simple` usage example into `server/index.ts` and add sample env var checks.
- Create a GitHub Actions workflow to build & push a Docker image to a container registry and deploy to Render.
