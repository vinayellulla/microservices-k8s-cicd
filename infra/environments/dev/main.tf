terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}



module "vpc" {
  source               = "../../modules/vpc"
  project              = var.project
  vpc_cidr             = var.vpc_cidr
  azs                  = var.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "eks" {
  source             = "../../modules/eks"
  project            = var.project
  cluster_version    = var.cluster_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "ecr" {
  source   = "../../modules/ecr"
  project  = var.project
  services = var.services
}


module "oidc" {
  source = "../../modules/oidc"
}

module "github_actions_role" {
  source                   = "../../modules/github-actions-role"
  project                  = var.project
  github_oidc_provider_arn = module.oidc.github_oidc_provider_arn
  github_org               = var.github_org
  github_repo              = var.github_repo
  ecr_repository_arns      = module.ecr.repository_arns
}

module "rds" {
  source                     = "../../modules/rds"
  project                    = var.project
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  eks_node_security_group_id = module.eks.node_security_group_id
  db_name                    = var.db_name
  master_username            = var.master_username
}
