resource "aws_ecr_repository" "svc" {
  for_each             = toset(var.services)
  name                 = "${var.project}-${each.key}"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_lifecycle_policy" "expire_untagged" {

  for_each   = aws_ecr_repository.svc
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Expire untagged images after 14 days"
      selection = {
        tagStatus   = "untagged"
        countType   = "sinceImagePushed"
        countUnit   = "days"
        countNumber = 14
      }
      action = { type = "expire" }
    }]
  })
}




