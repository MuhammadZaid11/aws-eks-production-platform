# Helm — Kubernetes Package Manager

## What Is Helm?

Helm is the package manager for Kubernetes. Instead of writing separate YAML files for every environment, you write a **chart** with templates and a `values.yaml` file. Helm fills in the templates with the values to produce the final Kubernetes manifests.

Think of it like this:
- Template = blueprint
- values.yaml = configuration
- Rendered manifest = what gets applied to Kubernetes

## This Project's Charts

```
helm/
├── frontend/     # Next.js app
├── backend/      # Node.js API
├── postgresql/   # Database
└── redis/        # Cache
```

Each chart has the same structure:
```
chart-name/
├── Chart.yaml        # chart metadata (name, version, description)
├── values.yaml       # default configuration values
└── templates/        # Kubernetes manifest templates
```

## Chart.yaml

```yaml
apiVersion: v2
name: frontend
description: Frontend Helm chart
version: 0.1.0
appVersion: "1.0.0"
```

`version` is the chart version. `appVersion` is the application version (usually overridden by CI with the image tag).

## values.yaml — The Key File

This is where all configuration lives. The CI pipeline updates this file to trigger deployments.

### Image Configuration
```yaml
image:
  repository: ""   # Set to your ECR URL
  pullPolicy: Always
  tag: "latest"    # CI overwrites this with git SHA
```

### Replica Count & Autoscaling
```yaml
replicaCount: 2   # always run 2 pods for HA

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70   # scale up when CPU > 70%
```

### Resource Limits
```yaml
resources:
  requests:
    cpu: 100m       # guaranteed CPU (100 millicores = 0.1 CPU)
    memory: 128Mi   # guaranteed memory
  limits:
    cpu: 500m       # maximum CPU
    memory: 512Mi   # maximum memory (OOMKilled if exceeded)
```

Always set both requests and limits. Without requests, the scheduler can't place pods properly. Without limits, one pod can starve others.

### Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: http
  initialDelaySeconds: 20   # wait 20s before first check
  periodSeconds: 20         # check every 20s

readinessProbe:
  httpGet:
    path: /api/health
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10
```

- **Liveness probe**: Is the container alive? If it fails, Kubernetes restarts the pod.
- **Readiness probe**: Is the container ready to serve traffic? If it fails, Kubernetes removes the pod from the load balancer but doesn't restart it.

### Pod Anti-Affinity
```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          topologyKey: kubernetes.io/hostname
```

This tells Kubernetes to prefer scheduling pods on different nodes. If both frontend pods land on the same node and that node fails, both pods go down. Anti-affinity spreads them across nodes.

### Environment Variables from Secrets
```yaml
env:
  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: backend-db-secret
        key: password
```

Never put actual passwords in values.yaml. Reference Kubernetes Secrets instead.

## Helm Commands

```bash
# Install a chart
helm install frontend ./helm/frontend -n ecommerce

# Upgrade an existing release
helm upgrade frontend ./helm/frontend -n ecommerce

# Install or upgrade (idempotent)
helm upgrade --install frontend ./helm/frontend -n ecommerce

# List installed releases
helm list -n ecommerce

# View rendered templates (dry run — doesn't apply anything)
helm template frontend ./helm/frontend

# Uninstall
helm uninstall frontend -n ecommerce

# Check release history
helm history frontend -n ecommerce

# Rollback to previous version
helm rollback frontend 1 -n ecommerce
```

## Overriding Values

You can override values at install time without editing values.yaml:

```bash
helm upgrade --install frontend ./helm/frontend \
  --set image.tag=abc1234 \
  --set replicaCount=3 \
  -n ecommerce
```

Or use a separate values file per environment:
```bash
helm upgrade --install frontend ./helm/frontend \
  -f helm/frontend/values.yaml \
  -f helm/frontend/values-prod.yaml \
  -n ecommerce
```

## How Argo CD Uses Helm

Argo CD reads the `helm/frontend` directory from Git and runs `helm template` to generate manifests, then applies them to the cluster. When the CI pipeline commits a new image tag to `values.yaml`, Argo CD detects the change and re-renders the templates with the new tag.

This is the GitOps loop:
```
CI updates values.yaml → git push → Argo CD detects change → helm template → kubectl apply
```
