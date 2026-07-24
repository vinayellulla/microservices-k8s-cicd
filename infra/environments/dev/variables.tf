variable "project" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "azs" {
  type = list(string)
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "private_subnet_cidrs" {
  type = list(string)
}

variable "cluster_version" {
  type = string
}

variable "services" {
  type = list(string)
}
variable "github_org" {
  type = string
}

variable "github_repo" {
  type = string
}

variable "db_name" {
  type = string
}

variable "master_username" {
  type = string
}


# variable "github_oidc_provider_arn" {
#   type = string

# }
