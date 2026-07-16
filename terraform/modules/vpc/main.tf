# Create VPC module
resource "aws_vpc" "eks_vpc" {

  cidr_block           = var.vpc_cidr

  enable_dns_hostnames = true

  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }

}

# Create Internet Gateway
resource "aws_internet_gateway" "igw" {

  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }

}

# Create Public Subnets
resource "aws_subnet" "public" {

  count = length(var.public_subnets)

  vpc_id = aws_vpc.eks_vpc.id

  cidr_block = var.public_subnets[count.index]

  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = {

    Name = "${var.project_name}-public-${count.index + 1}"

    "kubernetes.io/role/elb" = "1"

  }

}

# Create Private Subnets

resource "aws_subnet" "private" {

  count = length(var.private_subnets)

  vpc_id = aws_vpc.eks_vpc.id

  cidr_block = var.private_subnets[count.index]

  availability_zone = var.availability_zones[count.index]

  tags = {

    Name = "${var.project_name}-private-${count.index + 1}"

    "kubernetes.io/role/internal-elb" = "1"

  }

}