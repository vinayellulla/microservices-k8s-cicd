variable "project" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "oidc_provider_url" {
  type = string
}

variable "rds_secret_arn" {
  type = string
}

variable "eso_namespace" {
  type    = string
  default = "external-secrets"
}

variable "eso_service_account" {
  type    = string
  default = "external-secrets"
}
