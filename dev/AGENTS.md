# PlanApp Monorepo

## Key Commands

- `npm run dev` - Start web app (apps/web)
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `cd packages/db && npx drizzle-kit push` - Apply DB schema changes
- `cd packages/db && npx drizzle-kit studio` - Visual DB editor
- `atlas migrate apply --env datamart` - Apply Atlas migrations on datamart

## Structure

- `apps/web` - Next.js 16 app (App Router, acts as BFF)
- `packages/application` - Use cases & orchestration (sagas)
- `packages/api-app` - Operational API handlers (Hono)
- `packages/api-analytics` - Analytics/read API
- `packages/db` - Drizzle schema & connection
- `packages/reports` - Report generation
- `packages/storage` - Azure Blob storage boundary
- `k8s/` - Kubernetes manifests (Flux GitOps)
- `atlas/` - Atlas migrations (datamart)
- `dev/` - Architecture docs, ADRs, onboarding
- `robot/` - Agent journals & ontology

## WSL (arm64)

This dev machine runs WSL on **aarch64**. Docker Desktop provides x86_64 binaries that **will not execute** (kubectl, etc.). Install arm64 versions manually to `~/.local/bin/`.

## Database

Two PostgreSQL databases on Azure, both require `sslmode=require`:
- **Main**: `AZURE_PRISMA_POSTGRES_DATABASE_URL` — managed with Drizzle Kit
- **Datamart**: `AZURE_EMCGC_DATAMART_DATABASE_URL` — managed with Atlas only

## Auth

NextAuth v5 with Microsoft Entra ID. Redirect URI: `/api/auth/callback/microsoft-entra-id`.

## Deployment (Docker Compose on Azure VM)

Current web app CI/CD path: GitHub Actions → GHCR → self-hosted runner on Azure VM → Docker Compose + Nginx.

- Branch: `master` (not `main`)
- GitHub repo: `PLANAPPGOVPT/planapp-emcgc-monorepo` (old name `planapp-nextapp-prisma` still redirects)
- Runner labels: `[self-hosted, Linux, ARM64]`
- This deployment path is distinct from the ESPAP k3s/Flux VM below

### Azure VM (self-hosted CI/CD)

Use this host for the legacy/current self-hosted GitHub Actions deployment path:

- Hostname: `pla-we-nrpd-prisma-vm001`
- Public IP: `20.82.4.235`
- Tailscale IP: `100.107.116.90`
- SSH user: `hugo`
- SSH key: `~/.ssh/id_rsa_planapp`
- Typical SSH:
  ```bash
  ssh -i ~/.ssh/id_rsa_planapp hugo@20.82.4.235
  # or
  ssh -i ~/.ssh/id_rsa_planapp hugo@100.107.116.90
  ```

Expected services on this VM:
- `docker.service`
- `nginx.service`
- `actions.runner.PLANAPPGOVPT.planapp-vm-arm64.service`

Typical runner workspace:
- `/actions-runner/_work/planapp-emcgc-monorepo/planapp-emcgc-monorepo`

### GitHub Actions workflows

Relevant workflows:
- `.github/workflows/ci.yml`
- `.github/workflows/build-image.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-prod.yml`

Pipeline shape:
1. `ci.yml`
   - runs on `ubuntu-latest`
   - executes `npm ci`, `npm run lint`, `npm run build`
   - validates standalone server at `apps/web/.next/standalone/apps/web/server.js`
2. `build-image.yml`
   - builds `apps/web/Dockerfile`
   - publishes ARM64 image to GHCR using immutable tag
3. `deploy-staging.yml`
   - manual promotion (`workflow_dispatch`)
   - runs on self-hosted Azure VM runner
   - deploys `docker-compose.staging.yml`
   - installs `vm/nginx/staging.conf`
   - healthcheck: `https://prisma-staging.planapp.gov.pt/api/health`
4. `deploy-prod.yml`
   - manual promotion (`workflow_dispatch`)
   - runs on self-hosted Azure VM runner
   - deploys `docker-compose.prod.yml`
   - installs `vm/nginx/production.conf`
   - healthcheck: `https://prisma.planapp.gov.pt/api/health`

### Runtime ports and container names

- Staging container: `prisma-staging`
  - compose file: `docker-compose.staging.yml`
  - published port: `127.0.0.1:3002:3000`
- Production container: `prisma-prod`
  - compose file: `docker-compose.prod.yml`
  - published port: `127.0.0.1:3000:3000`

### Nginx config sources and targets

Versioned repo files:
- `vm/nginx/staging.conf`
- `vm/nginx/production.conf`

Targets on Azure VM:
- Staging site file: `/etc/nginx/sites-available/prisma-staging.planapp.gov.pt.conf`
- Staging enabled link: `/etc/nginx/sites-enabled/prisma-staging.planapp.gov.pt.conf`
- Production site file: `/etc/nginx/sites-available/prisma.planapp.gov.pt.conf`
- Production enabled link: `/etc/nginx/sites-enabled/prisma.planapp.gov.pt.conf`

### GitHub environments and secrets

Deploys expect GitHub Environments:
- `staging`
- `production`

Shared runtime secrets typically live at repo scope; environment-specific overrides should be minimal. `AUTH_URL` is the main value likely to differ between staging and production.

### Important operational pitfalls

- Do not confuse this Azure VM deployment path with the ESPAP VM (`172.30.26.11`) that runs k3s + Flux.
- A green image build does not mean staging/production was deployed; deploy workflows are manual (`workflow_dispatch`).
- The standalone Next.js server path is `apps/web/.next/standalone/apps/web/server.js` (not `apps/web/.next/standalone/server.js`).
- A common self-hosted runner failure is lack of passwordless sudo for Nginx operations. Preflight on the VM with:
  ```bash
  sudo -n true
  sudo -n nginx -t
  sudo -n systemctl reload nginx
  ```
- A container can be booted while `/api/health` still fails due to env or database connectivity issues.
- Always check repo/workflow state, GitHub environment/secrets, runner status, Docker state, Nginx config, and public health endpoint separately.

### Quick audit commands

Local repo / GitHub control plane:
```bash
gh workflow list
gh run list --limit 12
gh api repos/PLANAPPGOVPT/planapp-emcgc-monorepo/environments
gh secret list
gh secret list --env staging
gh secret list --env production
```

Azure VM:
```bash
hostname && whoami && uptime
systemctl list-units --type=service --all | egrep -i "runner|actions|docker|nginx" | cat
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
ss -tulpn | egrep ':80 |:443 |:3000 |:3002 ' | cat
```

## Kubernetes / GitOps (k8s/)

VM ESPAP running k3s v1.34.6 + Flux v2.8.5 for GitOps.

- **VM internal IP**: `172.30.26.11` (SSH: `hugomoreira@172.30.26.11`, key: `~/.ssh/id_rsa_planapp`)
- **VM Tailscale IP**: `100.77.33.95`
- **Kubeconfig**: `~/.kube/config-espap` (always set `KUBECONFIG=~/.kube/config-espap`)
- **Flux sync**: branch `master`, path `./k8s/clusters/espap`
- **Doppler**: project `planapp`, config `dev` — has `GH_PAT_K8S`, `VM_ESPAP_*`
- **Ingress**: NGINX Ingress Controller (installed via Flux HelmRelease)
- **Headlamp**: deployed in namespace `headlamp`, ServiceAccount with cluster-admin

### k8s directory layout

```
k8s/
├── clusters/espap/          # Flux sync root
│   └── flux-system/         # Auto-generated by flux bootstrap (DO NOT EDIT gotk-components.yaml)
├── infrastructure/sources/  # HelmRepositories
├── apps/planapp/            # App manifests (deployment, service, ingress)
└── scripts/install-k3s.sh   # k3s install script for the VM
```

### SSH to VM

```bash
ssh -i ~/.ssh/id_rsa_planapp hugomoreira@172.30.26.11
# Or via Tailscale (requires Tailscale on both sides):
ssh -i ~/.ssh/id_rsa_planapp hugomoreira@100.77.33.95
```

## Doppler Secrets

Project: `planapp`, Config: `dev`
- `GH_PAT_K8S` — GitHub PAT for Flux bootstrap (needs `repo` scope)
- `VM_ESPAP_IP`, `VM_ESPAP_USERNAME`, `VM_ESPAP_PASSWORD` — VM backup credentials

Access: `doppler secrets get <KEY> --project planapp --config dev --plain`
