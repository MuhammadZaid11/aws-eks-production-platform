module "vpc" {

  source = "../modules/vpc"

}

module "iam" {

  source = "../modules/iam"

  project_name = "eks-platform"

}

module "security_groups" {

  source = "../modules/security-groups"

  project_name = "eks-platform"

  vpc_id = module.vpc.vpc_id

}