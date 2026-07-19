# AWS Networking — VPC, Subnets, NAT Gateway

## Why Networking Matters for EKS

EKS worker nodes run in a VPC. The network design determines:
- Which nodes are reachable from the internet (security)
- How nodes reach the internet for updates (NAT)
- How load balancers expose your apps (public subnets)

## This Project's Network Architecture

```
Internet
    │
    ▼
Internet Gateway
    │
    ▼
Public Subnets (10.0.1.0/24, 10.0.2.0/24)
    │  - Load Balancers live here
    │  - NAT Gateway lives here
    │
    ▼
NAT Gateway
    │
    ▼
Private Subnets (10.0.3.0/24, 10.0.4.0/24)
    │  - EKS Worker Nodes live here
    │  - Pods run here
    │  - No direct internet access (more secure)
```

## Key Resources in vpc/main.tf

### VPC
```hcl
resource "aws_vpc" "eks_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true   # required for EKS
  enable_dns_support   = true   # required for EKS
}
```
`enable_dns_hostnames` and `enable_dns_support` must both be `true` for EKS to work properly.

### Public vs Private Subnets

Public subnets have `map_public_ip_on_launch = true` — resources launched here get a public IP.

Private subnets do NOT have this. Worker nodes in private subnets can only be reached from inside the VPC.

### Subnet Tags for EKS

```hcl
# Public subnets — tells AWS Load Balancer Controller to use these for internet-facing LBs
"kubernetes.io/role/elb" = "1"

# Private subnets — tells AWS LBC to use these for internal LBs
"kubernetes.io/role/internal-elb" = "1"
```

These tags are required for the AWS Load Balancer Controller to automatically provision load balancers.

### NAT Gateway

Worker nodes in private subnets need to reach the internet to:
- Pull Docker images from ECR
- Download OS updates
- Call AWS APIs

The NAT Gateway sits in a public subnet and forwards outbound traffic from private subnets to the internet. Inbound connections from the internet are blocked.

```hcl
resource "aws_eip" "nat" {
  domain = "vpc"   # Elastic IP for the NAT Gateway
}

resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id   # NAT lives in public subnet
}
```

### Route Tables

Route tables tell subnets where to send traffic:

- Public route table: `0.0.0.0/0 → Internet Gateway` (direct internet access)
- Private route table: `0.0.0.0/0 → NAT Gateway` (outbound only through NAT)

## Availability Zones

Subnets are spread across multiple AZs (e.g., `us-east-1a`, `us-east-1b`). This means if one AZ goes down, your nodes in the other AZ keep running. EKS requires at least 2 AZs.

## Security Groups

Security groups act as virtual firewalls at the instance level. The `security-groups` module creates a cluster security group that controls traffic to the EKS API server.

## Common Questions

**Why put worker nodes in private subnets?**
Security. Nodes in private subnets have no public IP, so they can't be directly attacked from the internet. All inbound traffic must come through a load balancer.

**What's the difference between a Security Group and a NACL?**
Security Groups are stateful (return traffic is automatically allowed) and apply to instances. NACLs are stateless and apply to subnets. This project uses Security Groups.

**Why does NAT Gateway cost money even when idle?**
NAT Gateway has an hourly charge plus a per-GB data charge. For dev/learning, destroy it when not in use with `terraform destroy`.
