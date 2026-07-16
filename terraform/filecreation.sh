#!/bin/bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$root_dir/dev"
mkdir -p "$root_dir/modules/vpc"

cat > "$root_dir/dev/main.tf" <<'EOF'
terraform {
  required_version = ">= 1.0.0"
}
EOF

cat > "$root_dir/dev/variables.tf" <<'EOF'
variable "region" {
  type    = string
  default = "us-east-1"
}
EOF

cat > "$root_dir/dev/outputs.tf" <<'EOF'
output "cluster_name" {
  value = ""
}
EOF

cat > "$root_dir/dev/provider.tf" <<'EOF'
provider "aws" {
  region = var.region
}
EOF

cat > "$root_dir/dev/terraform.tf" <<'EOF'
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
EOF

cat > "$root_dir/modules/vpc/main.tf" <<'EOF'
resource "aws_vpc" "this" {
  cidr_block = var.cidr_block
}
EOF

cat > "$root_dir/modules/vpc/variables.tf" <<'EOF'
variable "cidr_block" {
  type    = string
  default = "10.0.0.0/16"
}
EOF

cat > "$root_dir/modules/vpc/outputs.tf" <<'EOF'
output "vpc_id" {
  value = aws_vpc.this.id
}
EOF

printf "Terraform folder structure created under %s\n" "$root_dir"
