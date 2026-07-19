# Argo CD & GitOps

## What Is GitOps?

GitOps is a deployment model where Git is the single source of truth for what should be running in your cluster. You never run `kubectl apply` manually in production. Instead:

1. You commit the desired state to Git
2. A tool (Argo CD) continuously compares Git vs the cluster
3. If they differ, Argo CD syncs the cluster to match Git

Benefits:
- Full audit trail (every deployment is a git commit)
- Easy rollbacks (revert the commit)
- Drift detection (if someone manually changes the cluster, Argo CD detects and corrects it)
- Declarative — you describe what you want, not how to get there

## How Argo CD Works

```
Git Repository (desired state)
        │
        ▼
Argo CD polls for changes every 3 minutes
(or webhook for instant detection)
        │
        ▼
Compare desired state vs actual cluster state
        │
   ┌────┴────┐
   │ In Sync │  → nothing to do
   └─────────┘
        OR
   ┌──────────┐
   │ OutOfSync│  → apply changes to cluster
   └──────────┘
```

## The Argo CD Application

`argocd/frontend-app.yaml` defines what Argo CD should deploy:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: frontend
  namespace: argocd

spec:
  project: default

  source:
    repoURL: https://github.com/MuhammadZaid11/aws-eks-production-platform.git
    targetRevision: main          # watch the main branch
    path: helm/frontend           # use the Helm chart at this path

  destination:
    server: https://kubernetes.default.svc   # deploy to this cluster
    namespace: ecommerce                      # in this namespace

  syncPolicy:
    automated:
      prune: true       # delete resources removed from Git
      selfHeal: true    # revert manual changes to the cluster
```

### Key Fields Explained

`targetRevision: main` — Argo CD watches the `main` branch. When CI commits a new image tag, Argo CD picks it up within minutes.

`path: helm/frontend` — Argo CD knows this is a Helm chart and runs `helm template` to render the manifests.

`prune: true` — If you remove a resource from the Helm chart, Argo CD deletes it from the cluster. Without this, deleted resources linger.

`selfHeal: true` — If someone runs `kubectl edit` and manually changes something, Argo CD reverts it back to what's in Git. This enforces Git as the only way to change the cluster.

## Installing Argo CD

```bash
# Create namespace
kubectl create namespace argocd

# Install Argo CD
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=available deployment -l app.kubernetes.io/name=argocd-server \
  -n argocd --timeout=120s
```

## Accessing the Argo CD UI

```bash
# Port-forward to access locally
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get the initial admin password
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

Open https://localhost:8080, login with `admin` and the password above.

## Applying the Application

```bash
kubectl apply -f argocd/frontend-app.yaml
```

After applying, Argo CD will immediately sync the frontend Helm chart to the `ecommerce` namespace.

## The Full GitOps Loop

```
Developer pushes code to app/frontend/
        │
        ▼
GitHub Actions: lint → build → scan → push image to ECR
        │
        ▼
GitHub Actions: update helm/frontend/values.yaml with new image tag
        │
        ▼
git commit + push (automated by CI)
        │
        ▼
Argo CD detects values.yaml changed
        │
        ▼
Argo CD runs: helm template helm/frontend → kubectl apply
        │
        ▼
EKS performs rolling update: new pods start, old pods terminate
        │
        ▼
Zero-downtime deployment complete
```

## Rollback with GitOps

To roll back to a previous version:

```bash
# Option 1: Revert the git commit
git revert HEAD
git push

# Argo CD will sync the reverted values.yaml (old image tag) back to the cluster
```

```bash
# Option 2: Argo CD UI
# Go to the app → History → select previous sync → Rollback
```

```bash
# Option 3: Helm rollback (bypasses GitOps — use only in emergencies)
helm rollback frontend 1 -n ecommerce
```

Option 1 is preferred because it keeps Git as the source of truth.

## Creating Argo CD Apps for Backend

You currently only have `argocd/frontend-app.yaml`. Create a similar one for the backend:

```yaml
# argocd/backend-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: backend
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/MuhammadZaid11/aws-eks-production-platform.git
    targetRevision: main
    path: helm/backend
  destination:
    server: https://kubernetes.default.svc
    namespace: ecommerce
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Argo CD CLI

```bash
# Install argocd CLI
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd && sudo mv argocd /usr/local/bin/

# Login
argocd login localhost:8080

# List apps
argocd app list

# Sync an app manually
argocd app sync frontend

# Get app status
argocd app get frontend
```
