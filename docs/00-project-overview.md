# Project Overview

## What This Project Is

A production-grade Kubernetes platform on AWS, built to demonstrate real-world DevOps skills. Every component in this project mirrors what you would find in an actual company's infrastructure.

## The Big Picture

```
Developer pushes code
        │
        ▼
GitHub Actions (CI)
  - runs tests
  - builds Docker image
  - scans for vulnerabilities
  - pushes image to ECR
  - updates Helm values.yaml with new image tag
        │
        ▼
Git repo now has updated image tag (GitOps trigger)
        │
        ▼
Argo CD detects the change
  - compares desired state (Git) vs actual state (EKS)
  - syncs the cluster automatically
        │
        ▼
Amazon EKS runs the updated workload
```

## Project Structure

```
aws-eks-production-platform/
├── .github/workflows/       # CI/CD pipelines (GitHub Actions)
│   ├── backend.yml          # Build & deploy backend
│   ├── frontend.yml         # Build & deploy frontend
│   └── terraform.yml        # Validate & apply infrastructure
│
├── terraform/
│   ├── modules/             # Reusable infrastructure modules
│   │   ├── vpc/             # Networking (VPC, subnets, NAT, IGW)
│   │   ├── iam/             # IAM roles for EKS
│   │   ├── security-groups/ # Firewall rules
│   │   ├── eks/             # EKS cluster + node group
│   │   ├── ecr/             # Container registries
│   │   └── github-oidc/     # Keyless auth for GitHub Actions
│   └── dev/                 # Dev environment (calls the modules)
│
├── helm/                    # Kubernetes app packaging
│   ├── frontend/            # Next.js frontend chart
│   ├── backend/             # Node.js backend chart
│   ├── postgresql/          # Database chart
│   └── redis/               # Cache chart
│
├── k8s/                     # Raw Kubernetes manifests
│   ├── namespace/           # ecommerce namespace
│   ├── deployments/         # Deployment specs
│   ├── services/            # Service specs
│   └── ingress/             # Ingress rules
│
├── argocd/                  # Argo CD Application definitions
│   └── frontend-app.yaml    # GitOps app for frontend
│
├── app/                     # Application source code
│   ├── frontend/            # Next.js app
│   ├── backend/             # Node.js/Express API
│   └── docker-compose.yml   # Local development
│
└── docs/                    # You are here
```

## Documents in This Folder

| File | What You Learn |
|------|---------------|
| 01-terraform.md | How the infrastructure is built with Terraform |
| 02-networking.md | VPC, subnets, NAT Gateway, routing |
| 03-iam-security.md | IAM roles, OIDC, least privilege |
| 04-eks.md | EKS cluster, node groups, kubectl |
| 05-ecr-docker.md | Docker images, ECR, image tagging |
| 06-helm.md | Helm charts, values, templating |
| 07-github-actions.md | CI pipelines, OIDC auth, Trivy scanning |
| 08-argocd-gitops.md | GitOps, Argo CD, sync policies |
| 09-kubernetes-concepts.md | Core K8s objects used in this project |
| 10-next-steps.md | What to build next and why |
