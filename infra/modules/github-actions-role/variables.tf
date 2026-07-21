variable "project" {
  type = string
}

variable "github_oidc_provider_arn" {
  type = string
}

variable "github_org" {
  type = string
}

variable "github_repo" {
  type = string
}

variable "ecr_repository_arns" {
  type = map(string)
}
