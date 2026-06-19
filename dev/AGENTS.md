# PlanApp Top 10 Produtividade

## Key Commands

- `npm ci` - Install dependencies from the repo root
- `npm run dev` - Start the app locally
- `npm run build` - Build the production artifact
- `npm run lint` - Run lint checks

## Structure

- `src/` - Application source code
- `public/` - Static assets
- `dev/` - Operational and onboarding documentation

## Deployment and CI/CD policy

This app follows the same Kubernetes GitOps policy used by the PlanApp platform workloads running on the ESPAP k3s cluster.

- Runtime target: **k3s + Flux GitOps**, not Docker Compose on the Azure VM
- Canonical Git branch: `master` (not `main` or `staging`)
- Container registry: GHCR under `ghcr.io/planappgovpt/planapp-top10-produtividade`
- Delivery model: CI builds and publishes versioned images; Flux detects approved tags and updates Kubernetes manifests in the infra repo
- Image versioning policy for this short-lived app: automatic tags in the form `v0.0.<github.run_number>` are acceptable and intentionally sufficient while the Flux `ImagePolicy` remains semver-based

## Expected release flow

1. Application changes are merged to `master` in this repository.
2. GitHub Actions builds the app, validates it, and publishes a versioned container image to GHCR.
3. Flux image automation in the infrastructure repository watches that image repository.
4. Flux updates the Kubernetes manifest setter in `k8s/apps/produtividade-staging/deployment.yaml` on branch `master`.
5. Flux reconciles the cluster from the Git state under `k8s/clusters/espap`.

For this repository, the CI-generated tag currently comes from the GitHub Actions run number and produces tags such as `v0.0.57`. This is semver-compatible for Flux ordering and is enough for the expected short lifecycle of the app.

## Kubernetes / GitOps conventions

- Do not document this app as using the legacy Azure VM Docker Compose pipeline unless that becomes explicitly true.
- `ImageUpdateAutomation` should use the cluster Git source `flux-system` and push back to `master`.
- Image tags consumed by Flux should stay compatible with the configured semver policy.
- Kubernetes changes should be made in the infrastructure repository and allowed to reconcile through Flux, not applied manually as an operational norm.

## Operational notes

- Keep app-level docs aligned with the infra repository manifests and Flux automation.
- If CI publishes an image successfully but the cluster does not update, inspect `ImageRepository`, `ImagePolicy`, `ImageUpdateAutomation`, and the `flux-system` Git source before assuming an app issue.
- Treat branch drift (`staging` vs `master`) as a deployment bug because it breaks the standard GitOps promotion path.
