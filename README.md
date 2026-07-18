# 🚀 AWS EKS Production Platform

> A production-ready DevOps platform built on **Amazon EKS** using **Terraform**, **Helm**, **GitHub Actions**, **Argo CD**, and **AWS** following GitOps and Infrastructure as Code (IaC) best practices.

---

## 📖 Project Overview

This project demonstrates how to build and manage a production-grade Kubernetes platform on AWS using modern DevOps practices.

The infrastructure is provisioned with **Terraform**, applications are packaged with **Helm**, container images are stored in **Amazon ECR**, deployments are automated using **GitHub Actions**, and continuous delivery is managed through **Argo CD** using the GitOps workflow.

The project is designed as a portfolio project to showcase real-world DevOps skills and cloud-native architecture.

---

# 🏗️ Architecture

```text
                        GitHub
                           │
                     GitHub Actions
                           │
                Build & Push Docker Images
                           │
                      Amazon ECR
                           │
                        Argo CD
                           │
                     Amazon EKS
                           │
         AWS Load Balancer Controller
                           │
                     NGINX Ingress
                           │
          ┌────────────────┴───────────────┐
          │                                │
     React Frontend                 FastAPI Backend
          │                                │
          └──────────────┬─────────────────┘
                         │
                  PostgreSQL Database
                         │
                       Redis Cache

Monitoring:
- Prometheus
- Grafana

Logging:
- Fluent Bit
- Loki

Infrastructure:
- Terraform

Cloud:
- AWS
```

---

# 🚀 Features

* Infrastructure as Code using Terraform
* Production-ready Amazon EKS Cluster
* Custom VPC with Public & Private Subnets
* Internet Gateway & NAT Gateway
* IAM Roles and Security Groups
* Managed Node Groups
* Dockerized Applications
* Amazon Elastic Container Registry (ECR)
* Helm Charts
* GitHub Actions CI/CD Pipeline
* GitOps using Argo CD
* Prometheus Monitoring
* Grafana Dashboards
* Loki Centralized Logging
* Fluent Bit Log Collection
* Kubernetes Namespaces
* Rolling Updates
* Rollbacks
* Auto Scaling
* Production Best Practices

---

# 🛠️ Tech Stack

| Category                   | Technologies             |
| -------------------------- | ------------------------ |
| Cloud                      | AWS                      |
| Infrastructure             | Terraform                |
| Container Runtime          | Docker                   |
| Container Registry         | Amazon ECR               |
| Container Orchestration    | Amazon EKS               |
| Kubernetes Package Manager | Helm                     |
| CI                         | GitHub Actions           |
| CD                         | Argo CD                  |
| GitOps                     | Argo CD                  |
| Monitoring                 | Prometheus               |
| Visualization              | Grafana                  |
| Logging                    | Loki, Fluent Bit         |
| Ingress                    | NGINX Ingress Controller |
| Frontend                   | React                    |
| Backend                    | FastAPI                  |
| Database                   | PostgreSQL               |
| Cache                      | Redis                    |

---

# 📂 Repository Structure

```text
aws-eks-production-platform/
│
├── .github/
│   └── workflows/
│
├── terraform/
│   ├── modules/
│   ├── environments/
│   └── *.tf
│
├── helm/
│   ├── frontend/
│   ├── backend/
│   ├── postgres/
│   └── redis/
│
├── kubernetes/
│
├── argocd/
│
├── frontend/
│
├── backend/
│
├── docs/
│
└── README.md
```

---

# ⚙️ Infrastructure Components

* Amazon VPC
* Public Subnets
* Private Subnets
* Internet Gateway
* NAT Gateway
* Route Tables
* IAM Roles
* Security Groups
* Amazon EKS Cluster
* Managed Node Groups
* Amazon ECR Repositories

---

# ☸️ Kubernetes Components

* Namespace
* Deployment
* ReplicaSet
* Pods
* Services
* ConfigMaps
* Secrets
* Ingress
* Horizontal Pod Autoscaler

---

# 🔄 CI/CD Workflow

```text
Developer
      │
git push
      │
GitHub
      │
GitHub Actions
      │
Run Tests
      │
Build Docker Image
      │
Security Scan
      │
Push Image to Amazon ECR
      │
Update Helm Chart
      │
Argo CD Sync
      │
Amazon EKS
      │
Production Deployment
```

---

# 🌿 GitOps Workflow

```text
Git Repository
      │
      ▼
Argo CD
      │
Compare Desired State
      │
      ▼
Amazon EKS Cluster
      │
Self-Heal
      │
Automatic Synchronization
```

---

# 📊 Monitoring Stack

* Prometheus
* Grafana
* Kubernetes Metrics
* Node Metrics
* Pod Metrics
* Cluster Health Monitoring

---

# 📝 Logging Stack

* Fluent Bit
* Loki
* Grafana Logs

---

# 🔐 Security

* IAM Roles
* Security Groups
* Kubernetes Secrets
* RBAC
* Private Worker Nodes
* Least Privilege Access
* Immutable Docker Images

---

# 📈 Future Enhancements

* AWS Load Balancer Controller
* ExternalDNS
* cert-manager
* HTTPS with Let's Encrypt
* Karpenter
* Cluster Autoscaler
* AWS Secrets Manager
* External Secrets Operator
* OpenTelemetry
* Jaeger Distributed Tracing
* Multi-Environment Deployments (Dev, Stage, Production)
* Blue/Green Deployments
* Canary Deployments
* Disaster Recovery Strategy

---

# 📚 Learning Objectives

This project demonstrates practical experience with:

* AWS Networking
* Infrastructure as Code
* Kubernetes Administration
* Helm Chart Development
* GitOps
* CI/CD Automation
* Docker
* Cloud Security
* Monitoring & Observability
* Production Deployment Strategies

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/MuhammadZaid11/aws-eks-production-platform.git
cd aws-eks-production-platform
```

## Prerequisites

* AWS CLI
* Terraform
* Docker
* kubectl
* Helm
* eksctl
* Git

Verify installation:

```bash
aws --version
terraform version
kubectl version --client
helm version
docker --version
git --version
```

---

# 📅 Project Roadmap

* [x] Terraform Project Structure
* [x] AWS VPC & Networking
* [x] IAM Roles
* [x] Security Groups
* [x] Amazon EKS Cluster
* [x] Managed Node Groups
* [x] Kubernetes Fundamentals
* [x] Helm Charts
* [x] Amazon ECR
* [x] GitHub Actions CI
* [x] Argo CD GitOps
* [ ] AWS Load Balancer Controller
* [ ] NGINX Ingress
* [ ] Prometheus & Grafana
* [ ] Loki & Fluent Bit
* [ ] Cluster Autoscaler
* [ ] Karpenter
* [ ] ExternalDNS
* [ ] cert-manager
* [ ] Production Hardening

---

# 🎯 Project Purpose

This repository is part of my DevOps learning journey, focusing on building a production-ready Kubernetes platform using AWS cloud-native services and modern DevOps tools. It demonstrates practical experience in Infrastructure as Code, Kubernetes, CI/CD, GitOps, observability, and cloud infrastructure automation.

---

## 👨‍💻 Author

**Muhammad Zaid**

* 💼 Aspiring DevOps Engineer
* 🌍 Karachi, Pakistan
* 🔗 GitHub: https://github.com/MuhammadZaid11

---

## ⭐ Support

If you found this project helpful or interesting, consider giving it a **Star ⭐** on GitHub. Feedback and suggestions are always welcome!
