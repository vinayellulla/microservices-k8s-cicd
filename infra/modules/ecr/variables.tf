variable "services" {
  type    = list(string)
  default = ["user", "order", "payment", "notification"]
}

variable "project" {
  type = string
}
