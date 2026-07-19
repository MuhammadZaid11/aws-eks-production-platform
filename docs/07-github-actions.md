# GitHub Actions — CI/CD Pipelines

## Overview

This project has three workflows:

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Backend CI/CD | `backend.yml` | push to `app/backend/**` | Test, build, scan, push backend image |
| Frontend CI/CD | `frontend.yml` | push to `app/frontend/**` | Lint, build, scan, push frontend image |
| Terraform CI/CD | `terraform.yml` | push/PR to `terraform/**` | Validate, plan, apply infrastructure |

## Path Filtering — Smart Triggers

Each workflow only runs when relevant files change:

```yaml
on:
  push:
    branches: [main]
    paths:
      - "app/backend/**"
      - ".github/workflows/backend.yml"
```

If you only change frontend code, the backend workflow doesn't run. This saves CI minutes and speeds up feedback.

## OIDC Authentication

All three workflows authenticate to AWS using OIDC (no stored keys):

```yaml
permissions:
  id-token: write   # required for OIDC token request

- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

See `docs/03-iam-security.md` for how OIDC works.

## Backend Workflow — Step by Step

### 1. Checkout & Setup
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "npm"
    cache-dependency-path: app/backend/package-lock.json
```
`cache: "npm"` caches `node_modules` between runs. Speeds up subsequent runs significantly.

### 2. Install & Test
```yaml
- run: npm ci          # clean install (uses package-lock.json exactly)
- run: npm test        # must pass — do NOT use continue-on-error here
- run: npm audit --audit-level=high   # check for vulnerable dependencies
```

`npm ci` is preferred over `npm install` in CI because it's deterministic — it installs exactly what's in `package-lock.json`.

### 3. Build Docker Image
```yaml
- run: docker build -t $ECR_REPOSITORY:$IMAGE_TAG .
```

The image is built locally first so Trivy can scan it before it's pushed anywhere.

### 4. Trivy Vulnerability Scan
```yaml
- uses: aquasecurity/trivy-action@0.28.0
  with:
    image-ref: "backend:${{ env.IMAGE_TAG }}"
    severity: "CRITICAL,HIGH"
    exit-code: "1"   # pipeline fails if vulnerabilities found
```

This is a security gate. If the image has critical vulnerabilities, it never reaches ECR or production.

### 5. Push to ECR
```yaml
- run: |
    docker tag $ECR_REPOSITORY:$IMAGE_TAG $REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker push $REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
```

Note: `:latest` is deliberately NOT pushed. Every image in ECR maps to a specific git commit.

### 6. GitOps Trigger — Update Helm values.yaml
```yaml
- run: |
    sed -i "s/tag: \".*\"/tag: \"${IMAGE_TAG}\"/" ../../helm/backend/values.yaml
    git config user.name "github-actions[bot]"
    git add helm/backend/values.yaml
    git commit -m "ci: deploy backend image ${IMAGE_TAG}"
    git push
```

This is the bridge between CI and CD. The workflow commits the new image tag back to the repo. Argo CD watches the repo and picks up this change to deploy the new version.

Why `contents: write` permission is needed:
```yaml
permissions:
  id-token: write
  contents: write   # needed to commit back to the repo
```

## Frontend Workflow Differences

The frontend workflow adds two steps before Docker:

```yaml
- run: npm run lint    # ESLint check
- run: npm run build  # Next.js build (catches type errors early)
```

Building Next.js before Docker is smart — it catches build errors faster than waiting for the Docker build to fail.

## Terraform Workflow — Three Jobs

### Job 1: validate (always runs)
```yaml
- run: terraform fmt -check -recursive   # code style check
- run: terraform init -backend=false     # init without touching state
- run: terraform validate                # syntax and logic check
```

### Job 2: plan (only on pull requests)
```yaml
- run: terraform plan -no-color -out=tfplan
```
Posts the plan output as a comment on the PR so reviewers can see exactly what infrastructure will change before approving.

### Job 3: apply (only on push to main)
```yaml
environment: production   # requires manual approval if configured
- run: terraform apply -auto-approve
```

The `environment: production` gate means you can require a human to approve before Terraform applies. Configure this in GitHub repo Settings → Environments.

## Secrets Required

Set these in GitHub repo Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | ARN of the GitHub Actions IAM role (from Terraform output) |

## Workflow Best Practices Applied

- Path filtering to avoid unnecessary runs
- `npm ci` instead of `npm install`
- Dependency caching
- Security scanning before pushing
- Immutable image tags (git SHA)
- GitOps trigger via git commit
- Separate validate/plan/apply jobs for Terraform
- PR comments for Terraform plans
