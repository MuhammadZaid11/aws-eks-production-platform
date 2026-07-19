# Docker & Amazon ECR

## The Application Stack

This project has two containerized applications:

| App | Framework | Port | Dockerfile Location |
|-----|-----------|------|---------------------|
| Frontend | Next.js | 3000 | `app/frontend/Dockerfile` |
| Backend | Node.js/Express | 5000 | `app/backend/Dockerfile` |

## ECR Repositories

Two ECR repositories are created by Terraform:
- `mern-backend`
- `mern-frontend`

ECR is AWS's private Docker registry. Images pushed here are only accessible within your AWS account (unless you configure public access).

## Image Tagging Strategy

This project uses the **git commit SHA** as the image tag:

```yaml
IMAGE_TAG: ${{ github.sha }}
```

Example: `abc1234def5678...`

Why not `:latest`?
- `:latest` is mutable — you can't tell which code version is running
- git SHA is immutable — every tag maps to exactly one commit
- Makes rollbacks trivial: just deploy the previous SHA

## The CI Build Process

From `.github/workflows/backend.yml`:

```bash
# 1. Build the image locally
docker build -t backend:$IMAGE_TAG .

# 2. Scan for vulnerabilities BEFORE pushing
trivy image backend:$IMAGE_TAG

# 3. Tag with the full ECR registry URL
docker tag backend:$IMAGE_TAG $REGISTRY/backend:$IMAGE_TAG

# 4. Push to ECR
docker push $REGISTRY/backend:$IMAGE_TAG
```

The full ECR image URL format:
```
<account-id>.dkr.ecr.<region>.amazonaws.com/<repo-name>:<tag>
```

Example:
```
123456789012.dkr.ecr.us-east-1.amazonaws.com/mern-backend:abc1234
```

## Trivy Security Scanning

Trivy scans the Docker image for known CVEs (Common Vulnerabilities and Exposures) before it's pushed to ECR:

```yaml
- uses: aquasecurity/trivy-action@0.28.0
  with:
    image-ref: "backend:${{ env.IMAGE_TAG }}"
    severity: "CRITICAL,HIGH"
    exit-code: "1"   # fails the build if critical/high CVEs found
```

If Trivy finds a CRITICAL or HIGH vulnerability, the pipeline fails and the image is never pushed. This prevents vulnerable images from reaching production.

## Local Development with Docker Compose

For local development, use `app/docker-compose.yml` to run all services together:

```bash
cd app
docker compose up
```

This starts frontend, backend, postgres, and redis locally without needing a Kubernetes cluster.

## Authenticating Docker to ECR

ECR requires authentication before you can push/pull. The CI pipeline does this automatically:

```yaml
- uses: aws-actions/amazon-ecr-login@v2
```

Manually from your terminal:
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

ECR tokens expire after 12 hours.

## Helm values.yaml — Connecting ECR to Kubernetes

After building and pushing, the CI pipeline updates `helm/backend/values.yaml`:

```bash
sed -i "s/tag: \".*\"/tag: \"${IMAGE_TAG}\"/" helm/backend/values.yaml
git commit -m "ci: deploy backend image ${IMAGE_TAG}"
git push
```

This commit triggers Argo CD to sync the new image to the cluster. This is the GitOps pattern — Git is the source of truth for what version is deployed.

The `image.repository` in values.yaml must be set to your ECR URL:
```yaml
image:
  repository: "123456789012.dkr.ecr.us-east-1.amazonaws.com/mern-backend"
  tag: "abc1234"   # updated by CI
```

## Useful ECR Commands

```bash
# List repositories
aws ecr describe-repositories --region us-east-1

# List images in a repository
aws ecr list-images --repository-name mern-backend --region us-east-1

# Delete an image
aws ecr batch-delete-image \
  --repository-name mern-backend \
  --image-ids imageTag=abc1234 \
  --region us-east-1
```

## ECR Lifecycle Policies

In production, set lifecycle policies to automatically delete old images and control storage costs:

```json
{
  "rules": [{
    "rulePriority": 1,
    "description": "Keep last 10 images",
    "selection": {
      "tagStatus": "any",
      "countType": "imageCountMoreThan",
      "countNumber": 10
    },
    "action": { "type": "expire" }
  }]
}
```

This is a good addition to the ECR Terraform module.
