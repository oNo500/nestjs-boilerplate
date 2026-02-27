# Deployment Documentation

## Overview

- **Platform**: GCP Cloud Run (`asia-east1`)
- **Image Registry**: GCP Artifact Registry
- **CI/CD**: GitHub Actions
- **Secret Management**: GCP Secret Manager
- **Service URL**: https://api-fafvgmgkza-de.a.run.app

## Trigger Conditions

Automatically triggered when pushing to the `master` branch and changes involve the following paths:

- `apps/api/**`
- `packages/database/**`
- `Dockerfile`
- `.github/workflows/deploy-api.yml`

## GCP Resources

| Resource | Name |
|---|---|
| Project | `gen-lang-client-0336247161` |
| Artifact Registry Repository | `asia-east1-docker.pkg.dev/.../boilerplate/api` |
| Cloud Run Service | `api` (`asia-east1`) |
| Workload Identity Pool | `github-pool` |
| Workload Identity Provider | `github-provider` |
| Service Account | `github-actions-sa@gen-lang-client-0336247161.iam.gserviceaccount.com` |

## GitHub Secrets

Configure in repository Settings -> Secrets and variables -> Actions:

| Secret | Description |
|---|---|
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full path of the Workload Identity Provider |
| `GCP_SERVICE_ACCOUNT` | Service Account email used for deployment |

## GCP Secret Manager

The following environment variables are injected from Secret Manager at runtime:

| Secret Name | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key |
| `REDIS_URL` | Redis connection string |

```bash
echo -n 'your-value' | gcloud secrets create SECRET_NAME --data-file=- --project=PROJECT_ID
```

## Workload Identity Federation

GitHub Actions authenticates with GCP via OIDC tokens, eliminating the need to store long-lived credentials.

Reference: https://github.com/google-github-actions/auth?tab=readme-ov-file#workload-identity-federation-through-a-service-account

The Service Account requires the following roles:
- `roles/artifactregistry.writer`
- `roles/run.admin`
- `roles/secretmanager.secretAccessor`
- `roles/iam.serviceAccountUser`

## Dockerfile Notes

Multi-stage build. Uses `pnpm deploy --prod --legacy` to package workspace dependencies into a flat structure, avoiding issues with pnpm symlinks breaking inside containers.

## Health Check

```bash
curl https://api-fafvgmgkza-de.a.run.app/health
```
