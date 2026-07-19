# Terraform — Infrastructure as Code

## What Is Terraform?

Terraform lets you describe your AWS infrastructure in code (`.tf` files) instead of clicking through the AWS console. The benefit: your infrastructure is version-controlled, repeatable, and reviewable like any other code.

## How This Project Uses Terraform

### Module Pattern

Instead of writing all resources in one big file, this project splits infrastructure into reusable **modules**:

```
terraform/
├── modules/          ← reusable building blocks
│   ├── vpc/
│   ├── iam/
│   ├── security-groups/
│   ├── eks/
│   ├── ecr/
│   └── github-oidc/
└── dev/              ← environment that calls the modules
    ├── main.tf       ← wires all modules together
    ├── variables.tf
    ├── outputs.tf
    ├── provider.tf
    └── terraform.tf
```

Think of modules like functions — you define them once and call them with different inputs.

### The dev/main.tf File

This is the entry point. It calls each module and passes the required inputs:

```hcl
module "vpc" {
  source = "../modules/vpc"
}

module "eks" {
  source           = "../modules/eks"
  cluster_name     = "eks-platform-cluster"
  cluster_role_arn = module.iam.cluster_role_arn   # output from iam module
  private_subnets  = module.vpc.private_subnets    # output from vpc module
  cluster_sg       = module.security_groups.cluster_sg
}
```

Notice how modules pass data to each other using **outputs**. The VPC module outputs subnet IDs, and the EKS module takes those as inputs.

## Core Terraform Commands

```bash
# Initialize — downloads providers and modules
terraform init

# Preview what will be created/changed/destroyed
terraform plan

# Apply the changes
terraform apply

# Destroy everything (careful!)
terraform destroy
```

## Each Module Explained

### vpc module
Creates the network foundation:
- VPC with CIDR block
- Public subnets (for load balancers)
- Private subnets (for worker nodes — they never get public IPs)
- Internet Gateway (public internet access)
- NAT Gateway (lets private nodes reach the internet for updates)
- Route tables wiring it all together

### iam module
Creates IAM roles that EKS needs:
- `eks-cluster-role` — the EKS control plane assumes this to manage AWS resources
- `eks-node-role` — worker nodes assume this to pull images from ECR, write logs, etc.

### security-groups module
Firewall rules:
- Cluster security group — controls traffic to/from the EKS API server

### eks module
The actual Kubernetes cluster:
- EKS control plane (managed by AWS)
- Managed Node Group — EC2 instances that run your pods
- Kubernetes version 1.33
- 2 nodes (min 2, max 3) in private subnets

### ecr module
Creates ECR repositories for storing Docker images:
- `mern-backend` repository
- `mern-frontend` repository

### github-oidc module
Enables GitHub Actions to authenticate to AWS **without storing any AWS keys**. See `docs/03-iam-security.md` for details.

## Key Concepts

**State file** (`terraform.tfstate`): Terraform tracks what it has created in this file. Never delete it. In production, store it in S3 with DynamoDB locking.

**Provider**: Tells Terraform which cloud to talk to. This project uses the AWS provider.

**Resource**: A single piece of infrastructure (e.g., `aws_vpc`, `aws_eks_cluster`).

**Data source**: Reads existing AWS resources without managing them.

**Output**: A value exported from a module so other modules can use it.

## What the CI Pipeline Does with Terraform

The `terraform.yml` workflow:
- On **pull request**: runs `fmt`, `validate`, and `plan` — posts the plan as a PR comment
- On **push to main**: runs `apply` — actually changes infrastructure

This means infrastructure changes go through code review just like application code.
