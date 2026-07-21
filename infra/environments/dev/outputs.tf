output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "github_actions_role_arn" {
  value = module.github_actions_role.role_arn
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "rds_cluster_endpoint" {
  value = module.rds.cluster_endpoint
}

output "rds_secret_arn" {
  value = module.rds.secret_arn
}
