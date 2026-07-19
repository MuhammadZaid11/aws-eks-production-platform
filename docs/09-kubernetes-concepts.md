# Kubernetes Concepts Used in This Project

## Core Objects

### Namespace
Logical isolation within a cluster. This project uses `ecommerce` for all app workloads.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce
```

### Deployment
Manages a set of identical pods. Handles rolling updates and rollbacks.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: ecommerce
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    spec:
      containers:
        - name: frontend
          image: <ecr-url>/frontend:abc1234
          ports:
            - containerPort: 3000
```

The Helm chart generates this from the template + values.yaml.

### ReplicaSet
Automatically created by a Deployment. Ensures the desired number of pod replicas are running. You rarely interact with ReplicaSets directly.

### Pod
The smallest deployable unit. A pod runs one or more containers that share network and storage. In this project, each pod runs a single container.

### Service
Provides a stable network endpoint for a set of pods. Pods come and go (they get new IPs on restart), but the Service IP stays constant.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: ecommerce
spec:
  type: ClusterIP      # only reachable inside the cluster
  selector:
    app: frontend      # routes to pods with this label
  ports:
    - port: 3000
      targetPort: 3000
```

Service types used in this project:
- `ClusterIP` — internal only (frontend, backend, postgres, redis)
- `LoadBalancer` — creates an AWS NLB (used for ingress controller)

### ConfigMap
Stores non-sensitive configuration as key-value pairs. Mounted into pods as environment variables or files.

### Secret
Stores sensitive data (passwords, tokens, keys) base64-encoded. Referenced in Helm values.yaml via `secretKeyRef`.

```bash
# Create a secret
kubectl create secret generic backend-db-secret \
  --from-literal=username=dbuser \
  --from-literal=password=dbpass \
  -n ecommerce
```

### Ingress
Routes external HTTP/HTTPS traffic to internal services based on hostname or path rules.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: ecommerce
spec:
  ingressClassName: nginx
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 3000
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 5000
```

Requires an Ingress Controller (NGINX) to be installed — this is on the project roadmap.

### Horizontal Pod Autoscaler (HPA)
Automatically scales the number of pods based on CPU or memory usage.

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

When CPU usage across all pods exceeds 70%, HPA adds more pods (up to 10). When usage drops, it scales back down (minimum 2).

Requires the Metrics Server to be installed:
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Rolling Updates

When you deploy a new image, Kubernetes performs a rolling update by default:

```
Old pods: [v1] [v1] [v1]
                │
                ▼ (new deployment)
Step 1:  [v1] [v1] [v2]   ← one new pod starts
Step 2:  [v1] [v2] [v2]   ← one old pod removed
Step 3:  [v2] [v2] [v2]   ← update complete
```

At no point are all pods down. This gives zero-downtime deployments.

The readiness probe ensures new pods only receive traffic once they're actually ready.

## Useful Debugging Commands

```bash
# Why is a pod not starting?
kubectl describe pod <pod-name> -n ecommerce

# What's the pod logging?
kubectl logs <pod-name> -n ecommerce

# Previous container logs (if pod restarted)
kubectl logs <pod-name> -n ecommerce --previous

# Is the service routing to pods correctly?
kubectl get endpoints <service-name> -n ecommerce

# Check HPA status
kubectl get hpa -n ecommerce

# Check events in a namespace (great for debugging)
kubectl get events -n ecommerce --sort-by='.lastTimestamp'

# Resource usage per pod
kubectl top pods -n ecommerce

# Resource usage per node
kubectl top nodes
```

## Labels and Selectors

Labels are key-value pairs attached to objects. Selectors filter objects by labels.

```yaml
# Pod has this label
labels:
  app: frontend

# Service selects pods with this label
selector:
  app: frontend
```

This is how Services know which pods to route traffic to. Helm charts automatically set consistent labels across Deployments and Services.

## Pod Lifecycle

```
Pending → ContainerCreating → Running → Terminating
```

- `Pending`: Pod is scheduled but container hasn't started yet (pulling image, waiting for resources)
- `ContainerCreating`: Image is being pulled
- `Running`: Container is running
- `CrashLoopBackOff`: Container keeps crashing — check logs
- `OOMKilled`: Container exceeded memory limit — increase `resources.limits.memory`
- `ImagePullBackOff`: Can't pull the image — check ECR permissions and image tag
