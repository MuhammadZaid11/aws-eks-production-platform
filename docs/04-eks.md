# Amazon EKS — Kubernetes Cluster

## What Is EKS?

Amazon Elastic Kubernetes Service (EKS) is a managed Kubernetes service. AWS runs the control plane (API server, etcd, scheduler) for you. You only manage the worker nodes.

## This Project's EKS Setup

From `terraform/modules/eks/main.tf`:

```hcl
resource "aws_eks_cluster" "this" {
  name    = "eks-platform-cluster"
  version = "1.33"

  vpc_config {
    subnet_ids              = var.private_subnets
    endpoint_private_access = true
    endpoint_public_access  = true
  }
}

resource "aws_eks_node_group" "main" {
  instance_types = ["t3.medium"]   # or whatever var.instance_types is set to
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 2
    min_size     = 2
    max_size     = 3
  }
}
```

### Key Decisions Explained

**`endpoint_public_access = true`**: The Kubernetes API server is reachable from the internet. This lets you run `kubectl` from your laptop. In a stricter setup, you'd set this to `false` and use a VPN or bastion host.

**`endpoint_private_access = true`**: Nodes inside the VPC can reach the API server without going through the internet.

**Private subnets for nodes**: Worker nodes have no public IPs. They reach the internet through the NAT Gateway.

**`desired_size = 2`**: Always run 2 nodes for high availability. If one node fails, the other keeps serving traffic.

## Connecting to the Cluster

After `terraform apply`, configure kubectl:

```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name eks-platform-cluster
```

This writes credentials to `~/.kube/config`. Now you can run kubectl commands.

## Essential kubectl Commands

```bash
# Check cluster info
kubectl cluster-info

# List nodes
kubectl get nodes

# List all pods across all namespaces
kubectl get pods -A

# List pods in the ecommerce namespace
kubectl get pods -n ecommerce

# Describe a pod (useful for debugging)
kubectl describe pod <pod-name> -n ecommerce

# View pod logs
kubectl logs <pod-name> -n ecommerce

# Follow logs in real time
kubectl logs -f <pod-name> -n ecommerce

# Execute a command inside a running container
kubectl exec -it <pod-name> -n ecommerce -- /bin/sh

# Get all resources in a namespace
kubectl get all -n ecommerce
```

## Namespaces

This project uses the `ecommerce` namespace (defined in `k8s/namespace/namespace.yml`):

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce
```

Namespaces provide logical isolation. All app workloads (frontend, backend, postgres, redis) run in `ecommerce`. Argo CD runs in the `argocd` namespace.

Apply it:
```bash
kubectl apply -f k8s/namespace/namespace.yml
```

## Node Groups vs Fargate

This project uses **Managed Node Groups** (EC2 instances). The alternative is Fargate (serverless pods). Node groups are better for:
- Predictable workloads
- Stateful applications (databases)
- More control over the underlying instance

Fargate is better for:
- Bursty, unpredictable workloads
- Simplicity (no node management)

## EKS Add-ons

EKS comes with core add-ons that should be kept updated:
- `kube-proxy` — network rules on each node
- `vpc-cni` — AWS VPC networking for pods (gives pods real VPC IPs)
- `coredns` — DNS resolution inside the cluster

Check add-on versions:
```bash
aws eks list-addons --cluster-name eks-platform-cluster --region us-east-1
```

## Upgrading the Cluster

EKS releases new Kubernetes versions regularly. The upgrade path:
1. Upgrade the control plane version in Terraform
2. Upgrade the node group (rolling replacement of nodes)
3. Update add-ons to match the new version

Always test upgrades in dev before production.

## Cost Considerations

EKS costs:
- Control plane: ~$0.10/hour (~$72/month)
- Worker nodes: EC2 instance cost (t3.medium ~$0.0416/hour each)
- NAT Gateway: ~$0.045/hour + data transfer

For learning, destroy the cluster when not in use:
```bash
cd terraform/dev
terraform destroy
```
