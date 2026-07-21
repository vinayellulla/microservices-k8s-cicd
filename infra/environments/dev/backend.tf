terraform {
  backend "s3" {
    bucket       = "microservices-cicd-tfstate-vinay"
    key          = "dev/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}
