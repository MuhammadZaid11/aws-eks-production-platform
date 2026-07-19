# IAM & Security — Roles, OIDC, Least Privilege

## IAM Roles in This Project

There are three distinct IAM roles, each with a specific purpose:

### 1. EKS Cluster Role
The EKS control plane assumes this role to manage AWS resources on your behalf — things like creating load balancers, describing EC2 instances, etc.

Required AWS managed policies:
- `AmazonEKSClusterPolicy`

### 2. EKS Node Role
EC2 worker nodes assume this role. Nodes need permissions to:
- Pull images from ECR
- Write logs to CloudWatch
- Register themselves with the cluster

Required AWS managed policies:
- `AmazonEKSWorkerNodePolicy`
- `AmazonEC2ContainerRegistryReadOnly`
- `AmazonEKS_CNI_Policy`

### 3. GitHub Actions Role
GitHub Actions workflows assume this role to deploy to AWS. This is the most interesting one — it uses OIDC instead of static keys.

## GitHub OIDC — Keyless Authentication

### The Problem with Static Keys
The old way: create an IAM user, generate access keys, store them as GitHub secrets. Problems:
- Keys never expire
- If leaked, attacker has permanent access
- Hard to rotate across many repos

### The OIDC Solution
GitHub Actions can request a short-lived token from AWS using OpenID Connect. No keys stored anywhere.

How it works:
```
GitHub Actions job starts
        │
        ▼
GitHub generates a JWT token (proves: "I am repo X, branch main")
        │
        ▼
Workflow calls AWS STS with this JWT
        │
        ▼
AWS verifies the JWT against GitHub's OIDC provider
        │
        ▼
AWS returns temporary credentials (valid for ~1 hour)
        │
        ▼
Workflow uses credentials to push to ECR, update EKS, etc.
```

### The Terraform Setup (github-oidc/main.tf)

```hcl
# Register GitHub as a trusted identity provider in your AWS account
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# Trust policy: only allow tokens from your specific repo on main branch
condition {
  test     = "StringLike"
  variable = "token.actions.githubusercontent.com:sub"
  values   = ["repo:MuhammadZaid11/aws-eks-production-platform:ref:refs/heads/main"]
}
```

The condition is critical — it restricts which GitHub repos and branches can assume this role. Without it, any GitHub repo could assume your role.

### Permissions Given to GitHub Actions Role

```hcl
# ECR: full access to push/pull images
"ecr:*"

# EKS: read cluster info (needed to configure kubectl)
"eks:DescribeCluster"
```

This follows **least privilege** — GitHub Actions only gets what it needs, nothing more.

### How the Workflow Uses It

```yaml
- name: Configure AWS credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

`AWS_ROLE_ARN` is the ARN of the GitHub Actions IAM role. This is not a secret in the traditional sense (it's not a key), but it's stored as a GitHub secret to avoid hardcoding account IDs.

## Kubernetes Secrets

Sensitive values like database passwords and JWT secrets are stored as Kubernetes Secrets, not in the Helm values.yaml:

```yaml
# In helm/backend/values.yaml — references a K8s Secret
- name: DB_PASS
  valueFrom:
    secretKeyRef:
      name: backend-db-secret
      key: password
```

You create the secret manually (or via External Secrets Operator):
```bash
kubectl create secret generic backend-db-secret \
  --from-literal=username=myuser \
  --from-literal=password=mypassword \
  -n ecommerce
```

## Pod Security

Both frontend and backend Helm charts enforce security at the pod level:

```yaml
podSecurityContext:
  runAsNonRoot: true    # container cannot run as root
  runAsUser: 1001       # specific non-root user

securityContext:
  allowPrivilegeEscalation: false   # cannot gain more privileges
  capabilities:
    drop: [ALL]                     # drop all Linux capabilities
```

This limits what a compromised container can do on the host node.

## Security Best Practices Applied

| Practice | Where Applied |
|----------|--------------|
| No static IAM keys | GitHub OIDC module |
| Least privilege IAM | GitHub Actions policy (ECR + DescribeCluster only) |
| Private worker nodes | VPC private subnets |
| Non-root containers | Helm values podSecurityContext |
| Secrets not in code | K8s Secrets via secretKeyRef |
| Image vulnerability scanning | Trivy in CI pipeline |
| Immutable image tags | git SHA used as tag, no `:latest` |
