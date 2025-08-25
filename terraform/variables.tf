variable "cloudflare-api-token" {
  type = string
  sensitive = true
}

variable "cloudflare-account-id" {
  type = string
  sensitive = true
}

variable "queue-name" {
  type = string
  default = "queens-queue"
}