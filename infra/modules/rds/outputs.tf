output "cluster_endpoint" {
  value = aws_rds_cluster.aurora.endpoint
}

output "reader_endpoint" {
  value = aws_rds_cluster.aurora.reader_endpoint
}

output "secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}
