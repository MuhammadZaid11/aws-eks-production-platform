# Next Steps — What to Build and Why

## Current Status

Completed:
- Terraform infrastructure (VPC, IAM, Security Groups, EKS, ECR, GitHub OIDC)
- Helm charts (frontend, backend, postgresql, redis)
- GitHub Actions CI/CD (backend, frontend, terraform pipelines)
- Argo CD GitOps (frontend app)
- Kubernetes namespace

## Immediate Next Steps

### 1. Create Argo CD App for Backend
You have `argocd/frontend-app.yaml` but no backend equivalent.

```bash
cp argocd/frontend-app.yaml argocd/backend-app.yaml
# Edit: change name to "backend", path to "helm/backend"
kubectl apply -f argocd/backend-app.yaml
```

### 2. Fill in the k8s/ Raw Manifests
Several files in `k8s/` are empty (0 bytes):
- `k8s/deployments/backend-deployment.yml`
- `k8s/deployments/frontend-deployment.yml`
- `k8s/services/backend-service.yml`
- `k8s/services/frontend-service.yml`
- `k8s/ingress/app-ingress.yml`

These are good learning exercises — write them manually before using Helm. Understanding raw manifests makes Helm charts much easier to understand.

### 3. Set ECR Repository URLs in Helm values.yaml
Both `helm/frontend/values.yaml` and `helm/backend/values.yaml` have empty `image.repository`:

```yaml
image:
  repository: ""  # ← fill this in
```

Get your account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

Then set:
```
123456789012.dkr.ecr.us-east-1.amazonaws.com/mern-frontend
123456789012.dkr.ecr.us-east-1.amazonaws.com/mern-backend
```

### 4. Add Argo CD Apps for PostgreSQL and Redis
You have Helm charts for both but no Argo CD Application definitions.

---

## Roadmap Items (In Priority Order)

### NGINX Ingress Controller
Why: Right now there's no way to reach your apps from the internet. NGINX Ingress is the gateway.

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

After installing, enable ingress in your Helm values:
```yaml
ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Prometheus & Grafana (Monitoring)
Why: You need visibility into cluster health, pod CPU/memory, request rates, and error rates.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

Access Grafana:
```bash
kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring
```

### Loki & Fluent Bit (Logging)
Why: Centralized log aggregation. Instead of `kubectl logs` on individual pods, query all logs in one place via Grafana.

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm upgrade --install loki grafana/loki-stack \
  --namespace logging --create-namespace \
  --set fluent-bit.enabled=true \
  --set grafana.enabled=false   # use existing Grafana
```

### AWS Load Balancer Controller
Why: Provisions AWS Application Load Balancers (ALB) from Kubernetes Ingress resources. More AWS-native than NGINX for production.

Requires:
1. IRSA (IAM Roles for Service Accounts) — attach IAM policy to a K8s service account
2. Helm install of the controller

### Cluster Autoscaler
Why: Automatically adds/removes EC2 nodes based on pending pods. Right now you have a fixed 2-3 nodes.

```bash
helm repo add autoscaler https://kubernetes.github.io/autoscaler
helm upgrade --install cluster-autoscaler autoscaler/cluster-autoscaler \
  --namespace kube-system \
  --set autoDiscovery.clusterName=eks-platform-cluster \
  --set awsRegion=us-east-1
```

### cert-manager + Let's Encrypt
Why: Automatic HTTPS certificates. Without this, your app runs on HTTP.

```bash
helm repo add jetstack https://charts.jetstack.io
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set installCRDs=true
```

### Terraform Remote State
Why: Right now `terraform.tfstate` is local. If you lose it, Terraform loses track of what it created. Store state in S3:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "eks-platform/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

---

## Skills This Project Demonstrates

When talking to employers, you can say you have hands-on experience with:

- **Infrastructure as Code**: Terraform modules, state management, CI/CD for infrastructure
- **Kubernetes**: Deployments, Services, Ingress, HPA, Namespaces, Secrets
- **AWS**: EKS, ECR, VPC, IAM, NAT Gateway, Security Groups
- **CI/CD**: GitHub Actions, path filtering, OIDC auth, Trivy scanning, immutable tags
- **GitOps**: Argo CD, automated sync, self-healing, drift detection
- **Security**: Least privilege IAM, non-root containers, no static keys, image scanning
- **Helm**: Chart development, values templating, environment overrides
- **Observability**: Prometheus, Grafana, Loki, Fluent Bit (once implemented)
